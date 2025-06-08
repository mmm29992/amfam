const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const OwnerCode = require("../models/OwnerCode");
const authenticateToken = require("../middleware/authMiddleware");
const EmployeeCode = require("../models/EmployeeCode");

const router = express.Router();

// Helper: Generate and send token in HTTP-only cookie
const sendTokenCookie = (res, user) => {
  const token = jwt.sign(
    { userId: user._id, userType: user.userType },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 60 * 60 * 1000, // 1 hour
  });

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
  console.log("🚨 Register endpoint hit:", req.body);

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
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });
  res.status(200).json({ message: "Logged out successfully" });
});

// Get all clients
router.get("/clients", authenticateToken, async (req, res) => {
  try {
    const clients = await User.find({ userType: "client" }).select("email");
    res.json(clients);
  } catch (err) {
    console.error("Error fetching clients:", err);
    res.status(500).json({ message: "Error fetching clients" });
  }
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
router.post("/update-profile", authenticateToken, async (req, res) => {
  const { newUsername, newEmail, password } = req.body;

  try {
    const user = await User.findById(req.user.userId);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password." });

    if (newUsername && newUsername !== user.username) {
      const usernameTaken = await User.findOne({ username: newUsername });
      if (usernameTaken)
        return res.status(400).json({ message: "Username already taken." });
      user.username = newUsername;
    }

    if (newEmail && newEmail !== user.email) {
      const emailTaken = await User.findOne({ email: newEmail });
      if (emailTaken)
        return res.status(400).json({ message: "Email already in use." });
      user.email = newEmail;
    }

    user.updatedAt = new Date();
    await user.save();

    res.status(200).json({ message: "Profile updated successfully." });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Failed to update profile." });
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

    res.clearCookie("token");
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



module.exports = router;
