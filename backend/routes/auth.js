const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const authenticateToken = require("../middleware/authMiddleware");
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
    maxAge: 60 * 60 * 1000,
  });

  return token;
};

// Register route
router.post("/register", async (req, res) => {
  const { username, email, password, userType } = req.body;

  try {
    if (!username || !email || !password || !userType) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (!["client", "employee"].includes(userType)) {
      return res.status(400).json({ message: "Invalid user type." });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    const user = new User({
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
        username: user.username,
        email: user.email,
        userType: user.userType,
      },
    });
  } catch (err) {
    console.error("Error during registration:", err);
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(400).json({
        message: `${field} "${err.keyValue[field]}" is already in use.`,
      });
    }
    res
      .status(500)
      .json({ message: "Internal server error. Please try again." });
  }
});

// ✅ Login route (username or email)
router.post("/login", async (req, res) => {
  const { identifier, password, userType } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user || user.userType !== userType) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

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

// GET /me
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

module.exports = router;
