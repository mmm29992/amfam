const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); // Import bcryptjs for password hashing
const User = require("../models/User");
const router = express.Router(); // <-- Initialize the router

// Register route
router.post("/register", async (req, res) => {
  const { username, email, password, userType } = req.body;

  try {
    // Validate userType
    if (!["client", "employee"].includes(userType)) {
      return res.status(400).json({ message: "Invalid user type" });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password before saving it
    const trimPass = password.trim();
    const hashedPassword = await bcrypt.hash(trimPass, 10);

    // Create new user with hashed password and userType
    const user = new User({
      username,
      email,
      password: hashedPassword,
      userType,
    });
    await user.save();

    // Return user data (excluding password) upon successful registration
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
  const { email, password, userType } = req.body; // <-- Make sure to get userType from the request body

  console.log("Login attempt:", { email, password, userType }); // Log the incoming login data

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if the provided userType matches the stored userType in the database
    if (user.userType !== userType) {
      console.log("User type mismatch");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare the password
    const cleanPass = password.trim();
    const isMatch = await bcrypt.compare(cleanPass, user.password);
    if (!isMatch) {
      console.log("Password mismatch");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token and include userType in the token payload
    const token = jwt.sign(
      { userId: user._id, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Send the token and userType in the response
    res.json({ token, userType: user.userType });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
