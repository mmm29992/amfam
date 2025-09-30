const express = require("express");
const Reminder = require("../models/Reminder");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

const isOwner = (user) => user.userType === "owner";
const isEmployee = (user) => user.userType === "employee";
const isClient = (user) => user.userType === "client";

function isValidDate(d) {
  return d instanceof Date && !isNaN(d.getTime());
}
function isEmail(s = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s).trim());
}

// Create Reminder
router.post("/", authenticateToken, async (req, res) => {
  const user = req.user;
  let {
    title,
    message,
    scheduledTime,
    sendEmail = false,
    targetEmail,
    emailSubject,
    emailBody,
    forClient = false,
    category,
    subcategory,
  } = req.body;

  // basic required
  if (!title || !message || !scheduledTime) {
    return res
      .status(400)
      .json({ message: "Title, message, and scheduledTime are required." });
  }

  // normalize/trim
  title = String(title).trim();
  message = String(message).trim();
  category = category ? String(category).trim() : undefined;
  subcategory = subcategory ? String(subcategory).trim() : undefined;

  const when = new Date(scheduledTime);
  if (!isValidDate(when)) {
    return res.status(400).json({ message: "scheduledTime is invalid." });
  }
  // optional: require future
  // if (when < new Date()) return res.status(400).json({ message: "scheduledTime must be in the future." });

  if (sendEmail) {
    if (!targetEmail || !isEmail(targetEmail)) {
      return res
        .status(400)
        .json({
          message: "Valid targetEmail required when sendEmail is true.",
        });
    }
    targetEmail = String(targetEmail).trim();
    emailSubject = emailSubject ? String(emailSubject).trim() : undefined;
    emailBody = emailBody ? String(emailBody).trim() : undefined;
  }

  try {
    const newReminder = await Reminder.create({
      title,
      message,
      scheduledTime: when,
      creatorId: user.userId,
      userType: user.userType,
      sendEmail,
      targetEmail: sendEmail ? targetEmail : undefined,
      emailSubject: sendEmail ? emailSubject : undefined,
      emailBody: sendEmail ? emailBody : undefined,
      category,
      subcategory,
      forClient: Boolean(forClient),
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

    if (isClient(user)) {
      query = { creatorId: user.userId, deleted: false };
    } else if (isEmployee(user)) {
      // employee sees own + global forClient reminders
      query = {
        deleted: false,
        $or: [{ creatorId: user.userId }, { forClient: true }],
      };
    } else if (isOwner(user)) {
      // owner sees all (query already matches)
      query = { deleted: false };
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

// Update Reminder (ownership + whitelist)
router.put("/:id", authenticateToken, async (req, res) => {
  const user = req.user;

  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    // authorization
    const owns = String(reminder.creatorId) === String(user.userId);
    if (!(owns || isOwner(user))) {
      // allow employees to edit only their own (owner can edit all)
      return res.status(403).json({ message: "Forbidden" });
    }

    const up = {};
    const allow = [
      "title",
      "message",
      "scheduledTime",
      "sendEmail",
      "targetEmail",
      "emailSubject",
      "emailBody",
      "forClient",
      "category",
      "subcategory",
    ];

    for (const k of allow) {
      if (k in req.body) up[k] = req.body[k];
    }

    // coerce/validate
    if ("scheduledTime" in up) {
      const when = new Date(up.scheduledTime);
      if (!isValidDate(when)) {
        return res.status(400).json({ message: "scheduledTime is invalid." });
      }
      up.scheduledTime = when;
    }
    if ("sendEmail" in up) up.sendEmail = Boolean(up.sendEmail);

    if (up.sendEmail) {
      if (!up.targetEmail || !isEmail(up.targetEmail)) {
        return res
          .status(400)
          .json({
            message: "Valid targetEmail required when sendEmail is true.",
          });
      }
      up.targetEmail = String(up.targetEmail).trim();
      if ("emailSubject" in up && up.emailSubject != null)
        up.emailSubject = String(up.emailSubject).trim();
      if ("emailBody" in up && up.emailBody != null)
        up.emailBody = String(up.emailBody).trim();
    } else {
      // turning off email clears fields
      up.targetEmail = undefined;
      up.emailSubject = undefined;
      up.emailBody = undefined;
    }

    Object.assign(reminder, up);
    reminder.updatedBy = user.userId;
    await reminder.save();

    res.status(200).json(reminder);
  } catch (err) {
    console.error("Error updating reminder:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// DELETE Reminder (soft delete) with ownership
router.delete("/:id", authenticateToken, async (req, res) => {
  const user = req.user;

  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    const owns = String(reminder.creatorId) === String(user.userId);
    if (!(owns || isOwner(user))) {
      return res.status(403).json({ message: "Forbidden" });
    }

    reminder.deleted = true;
    reminder.updatedBy = user.userId;
    await reminder.save();

    res.status(200).json({ message: "Reminder deleted successfully" });
  } catch (err) {
    console.error("Failed to delete reminder:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// RESTORE Reminder (owner or owner of reminder)
router.post("/:id/restore", authenticateToken, async (req, res) => {
  const user = req.user;

  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder)
      return res.status(404).json({ message: "Reminder not found" });

    const owns = String(reminder.creatorId) === String(user.userId);
    if (!(owns || isOwner(user))) {
      return res.status(403).json({ message: "Forbidden" });
    }

    reminder.deleted = false;
    reminder.updatedBy = user.userId;
    await reminder.save();

    res.status(200).json({ message: "Reminder restored" });
  } catch (err) {
    console.error("Restore failed:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Fetch reminders for a specific user (admin/owner only; employees optional)
router.get("/user/:userId", authenticateToken, async (req, res) => {
  const user = req.user;

  // Owners can view anyone; employees can view only their own by this route (or allow forClient too if you want)
  if (!(isOwner(user) || String(user.userId) === String(req.params.userId))) {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const reminders = await Reminder.find({
      creatorId: req.params.userId,
      deleted: false,
    })
      .sort({ scheduledTime: 1 })
      .populate("creatorId", "firstName lastName");

    res.status(200).json(reminders);
  } catch (err) {
    console.error("Error fetching user reminders:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
