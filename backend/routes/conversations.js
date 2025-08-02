const express = require("express");
const router = express.Router(); // ✅ This line is missing
const authenticateToken = require("../middleware/authMiddleware");
const Conversation = require("../models/ConversationTemp"); // Adjust the path as needed

// GET or CREATE conversation for a client
router.get("/convo/:clientId", authenticateToken, async (req, res) => {
  const { clientId } = req.params;

  try {
    let convo = await Conversation.findOne({ clientId });

    if (!convo) {
      convo = await Conversation.create({ clientId });
    }

    res.json(convo);
  } catch (err) {
    console.error("Error in GET /convo/:clientId", err);
    res.status(500).json({ message: "Error getting conversation." });
  }
});

// POST message (with optional attachment + auto-assign logic)
router.post("/convo/:convoId/message", authenticateToken, async (req, res) => {
  const { convoId } = req.params;
  const { message, attachmentUrl, attachmentType, isSystem } = req.body;

  try {
    const convo = await Conversation.findById(convoId);
    if (!convo)
      return res.status(404).json({ message: "Conversation not found" });

    // Auto-assign if an employee is replying and no one is assigned yet
    const isStaff = ["employee", "owner"].includes(req.user.userType);

    // Push the actual message
    const newMessage = {
      senderId: isSystem ? null : req.user.userId,
      message,
      isSystem: isSystem || false,
      attachmentUrl,
      attachmentType,
      timestamp: new Date(), // ✅ Add this
    };

    convo.messages.push(newMessage);
    convo.isResolved = false;

    await convo.save();

    res.status(201).json(convo);
  } catch (err) {
    res.status(500).json({ message: "Error sending message." });
  }
});

// PATCH: mark all messages as seen by current user
// PATCH: mark all messages as seen by current user
router.patch("/convo/:convoId/seen", authenticateToken, async (req, res) => {
  const { convoId } = req.params;
  const userId = req.user.userId;

  try {
    const convo = await Conversation.findById(convoId);
    if (!convo)
      return res.status(404).json({ message: "Conversation not found" });

    convo.messages.forEach((msg) => {
      if (!msg.seenBy) msg.seenBy = [];

      // ✅ Only mark as seen if someone else sent it
      if (msg.senderId?.toString() !== userId && !msg.seenBy.includes(userId)) {
        msg.seenBy.push(userId);
      }
    });

    await convo.save();
    res.json({ message: "Messages marked as seen." });
  } catch (err) {
    res.status(500).json({ message: "Error updating seen status." });
  }
});

// PATCH typing status
router.patch("/convo/:convoId/typing", authenticateToken, async (req, res) => {
  const { convoId } = req.params;
  const { isTyping } = req.body;

  try {
    const convo = await Conversation.findById(convoId);
    if (!convo)
      return res.status(404).json({ message: "Conversation not found" });

    convo.typingStatus.set(req.user.userId.toString(), isTyping);
    await convo.save();

    res.json({ message: "Typing status updated." });
  } catch (err) {
    res.status(500).json({ message: "Error updating typing status." });
  }
});

// PATCH: assign employee
router.patch("/convo/:convoId/assign", authenticateToken, async (req, res) => {
  const { convoId } = req.params;

  try {
    const convo = await Conversation.findById(convoId);
    if (!convo)
      return res.status(404).json({ message: "Conversation not found" });

    convo.assignedEmployeeId = req.user.userId;
    convo.history.push({ employeeId: req.user.userId, startedAt: new Date() });

    convo.messages.push({
      senderId: null,
      message: `You have been connected with ${
        req.user.userType === "employee" ? "an agent" : "support"
      }.`,
      isSystem: true,
      timestamp: new Date(), // ✅ Add this
    });

    await convo.save();
    res.json({ message: "Conversation assigned.", convo });
  } catch (err) {
    res.status(500).json({ message: "Error assigning conversation." });
  }
});

// PATCH: mark convo as complete
router.patch(
  "/convo/:convoId/complete",
  authenticateToken,
  async (req, res) => {
    const { convoId } = req.params;
    const { reason } = req.body;

    try {
      const convo = await Conversation.findById(convoId);
      if (!convo)
        return res.status(404).json({ message: "Conversation not found" });

      convo.isResolved = true;
      convo.history[convo.history.length - 1].completedAt = new Date();
      convo.history[convo.history.length - 1].reason = reason || "Completed";

      convo.messages.push({
        senderId: null,
        message: `This conversation was marked complete.`,
        isSystem: true,
        timestamp: new Date(), // ✅ Add this
      });

      await convo.save();
      res.json({ message: "Conversation completed.", convo });
    } catch (err) {
      res.status(500).json({ message: "Error completing conversation." });
    }
  }
);

// GET: all conversations (admin/staff only)
router.get("/all", authenticateToken, async (req, res) => {
  try {
    const userType = req.user.userType;

    if (!["employee", "owner"].includes(userType)) {
      return res.status(403).json({ message: "Unauthorized." });
    }

    const conversations = await Conversation.find({})
      .select("_id clientId assignedEmployeeId messages")
      .lean();

    res.json(conversations);
  } catch (err) {
    console.error("Error fetching all conversations:", err);
    res.status(500).json({ message: "Error retrieving conversations." });
  }
});

router.patch(
  "/convo/:convoId/unassign",
  authenticateToken,
  async (req, res) => {
    const { convoId } = req.params;

    try {
      const convo = await Conversation.findById(convoId);
      if (!convo)
        return res.status(404).json({ message: "Conversation not found" });

      convo.assignedEmployeeId = undefined;

      convo.messages.push({
        senderId: null,
        isSystem: true,
        message: `This chat is now unassigned.`,
        timestamp: new Date(), // ✅ Add this
      });

      await convo.save();
      res.json({ message: "Chat unassigned.", convo });
    } catch (err) {
      res.status(500).json({ message: "Error unassigning chat." });
    }
  }
);

module.exports = router; // ✅ This MUST be here!
