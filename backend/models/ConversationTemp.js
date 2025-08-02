const mongoose = require("mongoose");
const { Schema } = mongoose;

const messageSchema = new Schema({
  senderId: { type: Schema.Types.ObjectId, ref: "User" },
  message: { type: String },
  isSystem: { type: Boolean, default: false },

  // New 🔽
  seenBy: [{ type: Schema.Types.ObjectId, ref: "User" }], // who has seen this message
  attachmentUrl: { type: String }, // file (image, doc, etc)
  attachmentType: { type: String }, // e.g., "image", "pdf", etc

  timestamp: { type: Date, default: Date.now },
});

const historySchema = new Schema({
  employeeId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  reason: { type: String },
});

const conversationSchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  messages: [messageSchema],

  assignedEmployeeId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  isResolved: { type: Boolean, default: false },

  typingStatus: {
    type: Map, // key: userId, value: true/false
    of: Boolean,
    default: {},
  },

  history: [historySchema],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

conversationSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Conversation", conversationSchema);
