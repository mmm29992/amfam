const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const Script = require("../models/Script");
const router = express.Router();

// Middleware to restrict access to employees only
const requireEmployee = (req, res, next) => {
  if (req.user.userType !== "employee") {
    return res
      .status(403)
      .json({ message: "Access restricted to employees only." });
  }
  next();
};

// GET all scripts
router.get("/", authenticateToken, requireEmployee, async (req, res) => {
  try {
    const scripts = await Script.find()
      .sort({ updatedAt: -1 })
      .populate("createdBy", "username")
      .populate("updatedBy", "username");

    res.json(scripts);
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve scripts." });
  }
});


// ✅ GET a specific script by ID with populated usernames
router.get("/:id", authenticateToken, requireEmployee, async (req, res) => {
  try {
    const script = await Script.findById(req.params.id)
      .populate("createdBy", "username")
      .populate("updatedBy", "username");

    if (!script) {
      return res.status(404).json({ message: "Script not found." });
    }

    res.json(script);
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve script." });
  }
});

// POST a new script
router.post("/", authenticateToken, requireEmployee, async (req, res) => {
  const { name, english, translation } = req.body;
  if (!name || !english || !translation) {
    return res.status(400).json({ message: "All fields are required." });
  }
  try {
    const newScript = new Script({
      name,
      english,
      translation,
      createdBy: req.user.userId,
      updatedBy: req.user.userId,
    });
    const saved = await newScript.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: "Failed to save script." });
  }
});

// PUT update a script
router.put("/:id", authenticateToken, requireEmployee, async (req, res) => {
  const { name, english, translation } = req.body;
  try {
    const existing = await Script.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Script not found." });
    }

    existing.name = name;
    existing.english = english;
    existing.translation = translation;
    existing.updatedBy = req.user.userId;
    existing.updatedAt = Date.now();

    const updated = await existing.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update script." });
  }
});

// DELETE a script
router.delete("/:id", authenticateToken, requireEmployee, async (req, res) => {
  try {
    const existing = await Script.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Script not found." });
    }

    await existing.deleteOne();
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: "Failed to delete script." });
  }
});

module.exports = router;
