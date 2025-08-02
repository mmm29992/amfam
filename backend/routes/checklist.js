const express = require("express");
const router = express.Router();
const ChecklistItem = require("../models/ChecklistItem");
const authenticateToken = require("../middleware/authMiddleware");

const priorityOrder = {
  "Quote Follow Up:Quotes Follow Up": 0,

  "Life:No Pay": 1,
  "Life:Cancel Status": 2,
  "Life:Cancel": 3,
  "Life:No Renewal": 4,
  "Life:Discount Remove": 5,
  "Life:Documents Needed": 6,

  "Commercial:No Pay": 7,
  "Commercial:Cancel Status": 8,
  "Commercial:Cancel": 9,
  "Commercial:No Renewal": 10,
  "Commercial:Discount Remove": 11,
  "Commercial:Documents Needed": 12,

  "PL Home:Quotes Follow Up": 13,
  "PL Home:No Pay": 14,
  "PL Home:Cancel Status": 15,
  "PL Home:Cancel": 16,
  "PL Home:No Renewal": 17,
  "PL Home:Discount Remove": 18,
  "PL Home:Documents Needed": 19,

  "PL Auto:No Pay": 20,
  "PL Auto:Cancel Status": 21,
  "PL Auto:Cancel": 22,
  "PL Auto:No Renewal": 23,
  "PL Auto:Discount Remove": 24,
  "PL Auto:Documents Needed": 25,

  "PL Renters:Quotes Follow Up": 26,
  "PL Renters:No Pay": 27,
  "PL Renters:Cancel Status": 28,
  "PL Renters:Cancel": 29,
  "PL Renters:No Renewal": 30,
  "PL Renters:Discount Remove": 31,
  "PL Renters:Documents Needed": 32,
};


// Create checklist item
router.post("/", authenticateToken, async (req, res) => {
  const { text, deadline, category, subcategory } = req.body;
  const { userId } = req.user;

  if (!text || !text.trim()) {
    return res.status(400).json({ message: "Task description is required." });
  }

  if (!category || !subcategory) {
    return res.status(400).json({ message: "Category and subcategory are required." });
  }

  try {
    const newItem = await ChecklistItem.create({
      text: text.trim(),
      creatorId: userId,
      deadline: deadline ? new Date(deadline) : undefined,
      category,
      subcategory,
    });

    res.status(201).json(newItem);
  } catch (err) {
    console.error("Checklist create error:", err);
    res.status(500).json({ message: "Failed to create checklist item" });
  }
});

// Get current user's checklist
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const items = await ChecklistItem.find({
      creatorId: req.user.userId,
      deleted: false,
    });
    // Replace the .sort({ createdAt: -1 }) line with this custom sort:
    const rawItems = await ChecklistItem.find({
      creatorId: req.user.userId,
      deleted: false,
    }).populate("creatorId", "username firstName lastName");

    const sortedItems = rawItems.sort((a, b) => {
      // 1. Compare deadlines (earlier = higher priority)
      const aDeadline = a.deadline
        ? new Date(a.deadline)
        : new Date("9999-12-31");
      const bDeadline = b.deadline
        ? new Date(b.deadline)
        : new Date("9999-12-31");

      if (aDeadline.getTime() !== bDeadline.getTime()) {
        return aDeadline - bDeadline;
      }

      // 2. Compare priority by category + subcategory
      const aKey = `${a.category}:${a.subcategory}`;
      const bKey = `${b.category}:${b.subcategory}`;

      return (
        (priorityOrder[aKey] ?? Infinity) - (priorityOrder[bKey] ?? Infinity)
      );
    });

    res.status(200).json(sortedItems);

  } catch (err) {
    console.error("Fetch checklist error:", err);
    res.status(500).json({ message: "Failed to fetch checklist items" });
  }
});

// Update checklist item
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const item = await ChecklistItem.findOne({
      _id: req.params.id,
      creatorId: req.user.userId,
    });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    Object.assign(item, req.body);
    item.updatedBy = req.user.userId;
    await item.save();

    res.status(200).json(item);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Failed to update checklist item" });
  }
});

// Soft delete
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const item = await ChecklistItem.findOneAndUpdate(
      { _id: req.params.id, creatorId: req.user.userId },
      { deleted: true },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json({ message: "Item deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Failed to delete checklist item" });
  }
});

// Restore soft-deleted checklist item
router.post("/:id/restore", authenticateToken, async (req, res) => {
  try {
    const item = await ChecklistItem.findOneAndUpdate(
      { _id: req.params.id, creatorId: req.user.userId },
      { deleted: false },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json({ message: "Item restored" });
  } catch (err) {
    console.error("Restore error:", err);
    res.status(500).json({ message: "Failed to restore item" });
  }
});

// Mark item as completed
router.patch("/:id/complete", authenticateToken, async (req, res) => {
  try {
    const item = await ChecklistItem.findOneAndUpdate(
      { _id: req.params.id, creatorId: req.user.userId },
      { completed: true, completedAt: new Date() },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json(item);
  } catch (err) {
    console.error("Complete error:", err);
    res.status(500).json({ message: "Failed to mark item complete" });
  }
});

// Mark item as not completed
router.patch("/:id/uncomplete", authenticateToken, async (req, res) => {
  try {
    const item = await ChecklistItem.findOneAndUpdate(
      { _id: req.params.id, creatorId: req.user.userId },
      { completed: false, completedAt: null },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json(item);
  } catch (err) {
    console.error("Uncomplete error:", err);
    res.status(500).json({ message: "Failed to mark item uncomplete" });
  }
});
// Fetch checklist for a specific user (admin viewing another user)
router.get("/user/:userId", authenticateToken, async (req, res) => {
  try {
    const items = await ChecklistItem.find({
      creatorId: req.params.userId,
      deleted: false,
    })
      .populate("creatorId", "username firstName lastName")
      .sort({ createdAt: -1 }); // Optional: apply a different sort

    res.status(200).json(items);
  } catch (err) {
    console.error("Failed to fetch checklist for user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});






module.exports = router;
