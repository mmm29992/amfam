const express = require("express");
const Reminder = require("../models/Reminder");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

// Create Reminder
router.post("/", authenticateToken, async (req, res) => {
  const user = req.user;
  const {
    title,
    message,
    scheduledTime,
    sendEmail = false,
    targetEmail,
    emailSubject,
    emailBody,
    forClient = false,
  } = req.body;

  if (!title || !message || !scheduledTime) {
    return res.status(400).json({
      message: "Title, message, and scheduledTime are required.",
    });
  }

  if (user.userType === "client") {
    if (sendEmail && targetEmail !== user.email) {
      return res.status(403).json({
        message: "Clients can only set reminders for their own email.",
      });
    }
  }

  try {
    const newReminder = await Reminder.create({
      title,
      message,
      scheduledTime: new Date(scheduledTime),
      creatorId: user.userId,
      userType: user.userType,
      sendEmail,
      targetEmail: sendEmail ? targetEmail : undefined,
      emailSubject: sendEmail ? emailSubject : undefined,
      emailBody: sendEmail ? emailBody : undefined,
      forClient,
      sent: false,
      deleted: false,
    });

    res.status(201).json(newReminder);
  } catch (err) {
    console.error("Failed to create reminder:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Fetch Reminders for Current User
router.get("/me", authenticateToken, async (req, res) => {
  const user = req.user;

  try {
    let query = { deleted: false };

    if (user.userType === "client") {
      query = { creatorId: user.userId, deleted: false };
    } else if (user.userType === "employee") {
      query = {
        $or: [{ creatorId: user.userId }, { forClient: true }],
        deleted: false,
      };
    }

    const reminders = await Reminder.find(query)
      .populate("creatorId", "username firstName lastName")
      .populate("updatedBy", "username firstName lastName")
      .sort({ scheduledTime: 1 });

    res.status(200).json(reminders);
  } catch (err) {
    console.error("Error fetching reminders:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update Reminder with updatedBy tracking
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    Object.assign(reminder, req.body);
    reminder.updatedBy = req.user.userId;
    await reminder.save();

    res.status(200).json(reminder);
  } catch (err) {
    console.error("Error updating reminder:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// DELETE Reminder (soft delete)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    reminder.deleted = true;
    await reminder.save();

    res.status(200).json({ message: "Reminder deleted successfully" });
  } catch (err) {
    console.error("Failed to delete reminder:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// RESTORE Reminder
router.post("/:id/restore", authenticateToken, async (req, res) => {
  try {
    const reminder = await Reminder.findByIdAndUpdate(
      req.params.id,
      { deleted: false },
      { new: true }
    );

    if (!reminder)
      return res.status(404).json({ message: "Reminder not found" });

    res.status(200).json({ message: "Reminder restored" });
  } catch (err) {
    console.error("Restore failed:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
