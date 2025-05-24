const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
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
    secure: process.env.NODE_ENV === "production", // Use HTTPS in prod
    sameSite: "Strict",
    maxAge: 60 * 60 * 1000, // 1 hour
  });

  return token;
};

// Register route
router.post("/register", async (req, res) => {
  const { username, email, password, userType } = req.body;

  try {
    if (!["client", "employee"].includes(userType)) {
      return res.status(400).json({ message: "Invalid user type" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const trimPass = password.trim();
    const hashedPassword = await bcrypt.hash(trimPass, 10);

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
    res.status(500).json({ message: "Server error" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { email, password, userType } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || user.userType !== userType) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const cleanPass = password.trim();
    const isMatch = await bcrypt.compare(cleanPass, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    sendTokenCookie(res, user);

    res.json({ userType: user.userType });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
