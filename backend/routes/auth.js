const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const OwnerCode = require("../models/OwnerCode");
const authenticateToken = require("../middleware/authMiddleware");
const EmployeeCode = require("../models/EmployeeCode");
const VerificationCode = require("../models/VerificationCode");
const crypto = require("crypto");
const router = express.Router();

const createTransporter = require("../utils/emailTransporter");
const mailer = createTransporter();

const FROM_NAME = process.env.MAIL_FROM_NAME || "Support";
const FROM_EMAIL = process.env.MAIL_FROM_EMAIL || process.env.EMAIL_USER; // fallback

// Optional: see SMTP status in Render logs at boot
if (process.env.NODE_ENV !== "production") {
  mailer
    .verify()
    .then(() => console.log("📧 SMTP ready"))
    .catch((e) => console.warn("❌ SMTP verify failed:", e?.message || e));
}

router.post("/request-password-reset", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "No account found with that email." });
    }

    // 1. Generate temporary password
    const tempPassword = crypto.randomBytes(6).toString("hex"); // e.g. "8d2fc9"
    const hashedTempPassword = await bcrypt.hash(tempPassword, 10);

    // 2. Save the new hashed password
    user.password = hashedTempPassword;
    await user.save();

    // 3. Send the email
    const message = `
Hi ${user.firstName || user.username},

We’ve generated a temporary password for your account:

🔐 Temporary Password: **${tempPassword}**

You can now log in using this password and change it from your profile settings.

If you didn’t request this reset, please contact us immediately.

– The Support Team
    `;

    await mailer.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject: "Your Temporary Password",
      text: message,
      html: `
   <p>Hi ${user.firstName || user.username},</p>
   <p>We’ve generated a temporary password for your account:</p>
   <p><strong>${tempPassword}</strong></p>
   <p>You can now log in using this password and change it from your profile settings.</p>
   <p>If you didn’t request this reset, please contact us immediately.</p>
   <p>– The Support Team</p>
 `,
    });

    console.log(`✅ Temp password sent to: ${email}`);
    return res.status(200).json({
      message: "Temporary password sent to your email.",
    });
  } catch (err) {
    console.error("Password reset error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

// Helper: Generate and send token in HTTP-only cookie
// --- Cookie helpers (cross-site safe in prod: Vercel <-> Render) ---
const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

function cookieOptions() {
  const prod = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: prod, // must be true in prod (HTTPS)
    sameSite: prod ? "none" : "lax", // cross-site in prod, dev-friendly locally
    path: "/",
    maxAge: ONE_WEEK,
  };
}

// Helper: Generate and send token in HTTP-only cookie
const sendTokenCookie = (res, user) => {
  // Use 'sub' per JWT standard; middleware will map to req.user.userId
  const token = jwt.sign(
    { sub: String(user._id), userType: user.userType },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  res.cookie("token", token, cookieOptions());
  return token;
};

// Register
router.post("/register", async (req, res) => {
  const {
    firstName,
    lastName,
    username,
    email,
    password,
    userType,
    employeeCode,
  } = req.body;
  console.log("🚨 Register endpoint hit:", { email, username, userType });

  try {
    if (
      !firstName ||
      !lastName ||
      !username ||
      !email ||
      !password ||
      !userType
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (!/^[a-zA-Z]+$/.test(firstName) || !/^[a-zA-Z]+$/.test(lastName)) {
      return res
        .status(400)
        .json({ message: "Names must contain only letters." });
    }

    if (!["client", "employee", "owner"].includes(userType)) {
      return res.status(400).json({ message: "Invalid user type." });
    }

    if (userType === "employee") {
      const latestCode = await EmployeeCode.findOne().sort({ createdAt: -1 });

      if (!latestCode || employeeCode.trim() !== latestCode.code.trim()) {
        return res
          .status(403)
          .json({ message: "Invalid or expired employee registration code." });
      }

      // Delete used code
      await EmployeeCode.deleteMany();

      // Generate a new one-time code
      const generateCode = () =>
        Math.random().toString(36).substring(2, 8).toUpperCase();
      const newCode = generateCode();
      await EmployeeCode.create({ code: newCode });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists)
      return res.status(400).json({ message: "Email is already registered." });

    const usernameExists = await User.findOne({ username });
    if (usernameExists)
      return res.status(400).json({ message: "Username is already taken." });

    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    const user = new User({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      userType,
    });

    await user.save();
    sendTokenCookie(res, user);

    res.status(201).json({
      message: "User created",
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        userType: user.userType,
      },
    });
  } catch (err) {
    console.error("Error during registration:", err);
    res
      .status(500)
      .json({ message: "Internal server error. Please try again." });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { identifier, password, userType } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.userType !== userType) {
      // Exception: allow owner login through employee route
      if (user.userType === "owner" && userType === "employee") {
        return res.status(200).json({
          codeRequired: true,
          userId: user._id,
          message: "Owner verification required",
        });
      }
      return res.status(400).json({ message: "Invalid user type" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    sendTokenCookie(res, user);

    res.status(200).json({
      message: "Logged in",
      user: {
        username: user.username,
        email: user.email,
        userType: user.userType,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// Owner code verification
router.post("/verify-owner-code", async (req, res) => {
  const { userId, code } = req.body;

  if (!userId || !code) {
    return res.status(400).json({ message: "All fields required." });
  }

  try {
    const user = await User.findById(userId);
    if (!user || user.userType !== "owner") {
      return res.status(403).json({ message: "Unauthorized access." });
    }

    const currentCode = await OwnerCode.findOne();
    if (!currentCode || code.trim() !== currentCode.code.trim()) {
      return res.status(401).json({ message: "Invalid verification code." });
    }

    sendTokenCookie(res, user);

    res.status(200).json({
      message: "Owner verified and logged in.",
      user: {
        username: user.username,
        email: user.email,
        userType: "owner",
      },
    });
  } catch (err) {
    console.error("Error in /verify-owner-code:", err);
    res.status(500).json({ message: "Server error during verification." });
  }
});

// Set owner code (only owner can call this)
router.post("/set-owner-code", authenticateToken, async (req, res) => {
  if (req.user.userType !== "owner") {
    return res.status(403).json({ message: "Unauthorized" });
  }

  const { newCode } = req.body;
  if (!newCode) return res.status(400).json({ message: "Code is required." });

  await OwnerCode.deleteMany();
  await OwnerCode.create({ code: newCode });

  res.status(200).json({ message: "Owner code updated successfully." });
});

// Get current user
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (err) {
    console.error("Error in /me route:", err);
    res.status(500).json({ message: "Server error while fetching user" });
  }
});

// Logout
router.post("/logout", (req, res) => {
  res.clearCookie("token", cookieOptions()); // must match set options
  res.status(200).json({ message: "Logged out successfully" });
});

// Change password
router.post("/change-password", authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.userId);
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.updatedAt = new Date();
    await user.save();

    res.status(200).json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("Password change error:", err);
    res.status(500).json({ message: "Failed to change password." });
  }
});

// Update profile
// Update profile
router.post("/update-profile", authenticateToken, async (req, res) => {
  const { newUsername, newEmail, password } = req.body;

  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password." });
    }

    if (!newUsername && !newEmail) {
      return res.status(400).json({ message: "No new values provided." });
    }

    if (newUsername && newUsername !== user.username) {
      const usernameTaken = await User.findOne({ username: newUsername });
      if (usernameTaken) {
        return res.status(400).json({ message: "Username already taken." });
      }
      user.username = newUsername;
    }

    if (newEmail && newEmail !== user.email) {
      const emailTaken = await User.findOne({ email: newEmail });
      if (emailTaken) {
        return res.status(400).json({ message: "Email already in use." });
      }
      user.email = newEmail;
    }

    user.updatedAt = new Date();
    await user.save();

    res.status(200).json({ message: "Profile updated successfully." });
  } catch (err) {
    console.error("Profile update error:", err);
    res
      .status(500)
      .json({ message: err?.message || "Failed to update profile." });
  }
});

// Delete account
router.post("/delete-account", authenticateToken, async (req, res) => {
  const { password, confirmPassword } = req.body;

  if (!password || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match." });
  }

  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.userType === "owner") {
      return res
        .status(403)
        .json({ message: "Owner account cannot be deleted." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Incorrect password." });

    user.email = `deleted_${user._id}@no-reply.com`;
    user.username = `deleted_user_${user._id}`;
    user.password = "deleted";
    user.deleted = true;
    await user.save();

    res.clearCookie("token", cookieOptions());
    return res.status(200).json({ message: "Account deactivated." });
  } catch (err) {
    console.error("Account deletion failed:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

// Set employee registration code (only owner can call this)
router.post("/set-employee-code", authenticateToken, async (req, res) => {
  if (req.user.userType !== "owner") {
    return res.status(403).json({ message: "Unauthorized" });
  }

  const { newCode } = req.body;
  if (!newCode) return res.status(400).json({ message: "Code is required." });

  // 🔐 Prevent overwrite if a code already exists
  const existing = await EmployeeCode.findOne();
  if (existing) {
    return res
      .status(400)
      .json({ message: "A code already exists. Wait for it to be used." });
  }

  await EmployeeCode.create({ code: newCode });

  res.status(200).json({ message: "Employee registration code created." });
});

// Get current employee registration code (only for owners)
router.get("/get-employee-code", authenticateToken, async (req, res) => {
  if (req.user.userType !== "owner") {
    return res.status(403).json({ message: "Unauthorized" });
  }

  try {
    const codeDoc = await EmployeeCode.findOne().sort({ createdAt: -1 });
    if (!codeDoc) {
      return res.status(404).json({ message: "No code set yet." });
    }

    res.status(200).json({ code: codeDoc.code });
  } catch (err) {
    console.error("Error fetching employee code:", err);
    res.status(500).json({ message: "Failed to fetch code." });
  }
});

// Delete employee code (only owner)
router.delete("/delete-employee-code", authenticateToken, async (req, res) => {
  if (req.user.userType !== "owner") {
    return res.status(403).json({ message: "Unauthorized" });
  }

  try {
    await EmployeeCode.deleteMany(); // Clears all existing codes
    res.status(200).json({ message: "Employee code deleted." });
  } catch (err) {
    console.error("Error deleting employee code:", err);
    res.status(500).json({ message: "Failed to delete employee code." });
  }
});

router.post("/start-registration", async (req, res) => {
  const {
    firstName,
    lastName,
    username,
    email,
    password,
    userType,
    employeeAccessCode,
  } = req.body;

  if (
    !firstName ||
    !lastName ||
    !username ||
    !email ||
    !password ||
    !userType
  ) {
    return res.status(400).json({ message: "All fields required" });
  }

  if (userType === "employee") {
    if (!employeeAccessCode) {
      return res
        .status(400)
        .json({ message: "Employee access code required." });
    }

    const latestCode = await EmployeeCode.findOne().sort({ createdAt: -1 });

    if (!latestCode || employeeAccessCode.trim() !== latestCode.code.trim()) {
      return res
        .status(403)
        .json({ message: "Invalid or expired employee code." });
    }
  }

  const existingCode = await VerificationCode.findOne({ email });
  const now = new Date();
  // ⏱️ Cooldown: 60 seconds between requests (uses updatedAt if present)
  if (existingCode?.updatedAt) {
    const since = now - new Date(existingCode.updatedAt);
    const cooldownMs = 60 * 1000;
    if (since < cooldownMs) {
      const wait = Math.ceil((cooldownMs - since) / 1000);
      return res.status(429).json({
        message: `Please wait ${wait}s before requesting a new code.`,
      });
    }
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes

  await VerificationCode.findOneAndUpdate(
    { email },
    { code, expiresAt },
    { upsert: true, new: true }
  );

  try {
    await mailer.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject: "Your Verification Code",
      text: `Your verification code is: ${code}`,
      // html: `<p>Your verification code is <b>${code}</b>.</p>` // optional
    });
    console.log(`✅ Verification code sent to ${email}`);
    return res
      .status(200)
      .json({ message: "Verification code sent to email." });
  } catch (e) {
    console.error("sendMail ERROR:", {
      name: e?.name,
      code: e?.code,
      command: e?.command,
      response: e?.response && e.response.toString().slice(0, 200),
      message: e?.message,
    });
    return res.status(500).json({ message: "Email failed" });
  }
});

router.post("/verify-email-code", async (req, res) => {
  const {
    email,
    code,
    firstName,
    lastName,
    username,
    password,
    userType,
    employeeAccessCode: employeeCode, // aliasing for clarity
  } = req.body;

  const existing = await VerificationCode.findOne({ email });
  const now = new Date();
  if (!existing || existing.code !== code || existing.expiresAt < now) {
    console.warn(`❌ Invalid verification attempt for email: ${email}`);
    return res
      .status(400)
      .json({ message: "Invalid or expired verification code." });
  }

  if (await User.findOne({ email })) {
    return res.status(400).json({ message: "Email already registered." });
  }

  if (await User.findOne({ username })) {
    return res.status(400).json({ message: "Username already taken." });
  }

  if (userType === "employee") {
    const latestCode = await EmployeeCode.findOne().sort({ createdAt: -1 });
    if (
      !employeeCode ||
      !latestCode ||
      employeeCode.trim() !== latestCode.code.trim()
    ) {
      return res
        .status(403)
        .json({ message: "Invalid employee registration code." });
    }
    await EmployeeCode.deleteMany();
    await EmployeeCode.create({
      code: Math.random().toString(36).substring(2, 8).toUpperCase(),
    });
  }

  const hashedPassword = await bcrypt.hash(password.trim(), 10);
  const user = new User({
    firstName,
    lastName,
    username,
    email,
    password: hashedPassword,
    userType,
  });

  console.log(`✅ User ${email} verified and registered as ${userType}`);
  await user.save();
  await VerificationCode.deleteOne({ email });

  sendTokenCookie(res, user);

  res.status(201).json({
    message: "User created and verified",
    user: { firstName, lastName, username, email, userType },
  });
});

router.post("/validate-employee-code", async (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ message: "Access code is required." });
  }

  const latest = await EmployeeCode.findOne().sort({ createdAt: -1 });

  if (!latest || code.trim() !== latest.code.trim()) {
    return res
      .status(403)
      .json({ message: "Invalid or expired employee code." });
  }

  res.status(200).json({ message: "Access code is valid." });
  console.log(`✅ Employee access code validated: ${code}`);
});

// 👇 Add this route
router.get("/clients", authenticateToken, async (req, res) => {
  try {
    const clients = await User.find({ userType: "client" }).select(
      "firstName lastName email username userType createdAt updatedAt _id"
    );
    res.json(clients);
  } catch (err) {
    console.error("Failed to get clients:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/users", authenticateToken, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// DELETE any user (admin only)
router.delete("/users/:id", authenticateToken, async (req, res) => {
  const { userId, userType } = req.user;
  const { adminCode } = req.body;

  if (userType !== "owner") {
    return res.status(403).json({ message: "Only owner can delete users." });
  }

  if (!adminCode) {
    return res.status(400).json({ message: "Admin code required." });
  }

  const ownerCode = await OwnerCode.findOne();
  if (!ownerCode || adminCode.trim() !== ownerCode.code.trim()) {
    return res.status(401).json({ message: "Invalid admin code." });
  }

  const userToDelete = await User.findById(req.params.id);
  if (!userToDelete) {
    return res.status(404).json({ message: "User not found." });
  }

  if (userToDelete.userType === "owner") {
    return res.status(403).json({ message: "Cannot delete owner account." });
  }

  await User.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "User deleted successfully." });
});

router.post("/view-password", authenticateToken, async (req, res) => {
  if (req.user.userType !== "owner") {
    return res.status(403).json({ message: "Unauthorized" });
  }
  const { userId, ownerCode } = req.body;

  try {
    const codeDoc = await OwnerCode.findOne({ code: ownerCode });
    if (!codeDoc) {
      return res.status(403).json({ message: "Invalid owner code." });
    }

    // Do NOT return hashes. Provide a safe action instead:
    // For example, trigger a reset email to the user:
    // await sendResetEmail(userId);
    return res.status(200).json({ message: "Action acknowledged." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// TEMP: ping email (remove after testing)
router.post("/test-email", async (req, res) => {
  try {
    const to = req.body.to || process.env.TEST_EMAIL_TO;
    if (!to) return res.status(400).json({ message: "Provide 'to' or set TEST_EMAIL_TO" });

    await mailer.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to,
      subject: "Ping from Brevo transporter",
      text: "Transporter OK ✅",
      html: "<p>Transporter OK ✅</p>",
    });

    res.json({ ok: true, to });
  } catch (e) {
    console.error("TEST EMAIL ERROR:", e?.response?.data || e?.message || e);
    res.status(500).json({ ok: false, error: e?.message || "Failed to send" });
  }
});


module.exports = router;
