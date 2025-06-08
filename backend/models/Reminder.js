const mongoose = require("mongoose");
const { Schema } = mongoose;

const ReminderSchema = new Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    scheduledTime: { type: Date, required: true },
    creatorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" }, // ✅ Tracks last editor

    userType: {
      type: String,
      enum: ["client", "employee", "owner"],
      required: true,
    },

    // Email
    sendEmail: { type: Boolean, default: false },
    targetEmail: { type: String },
    emailSubject: { type: String },
    emailBody: { type: String },

    // Flags
    forClient: { type: Boolean, default: false }, // ✅ NEW: Used to identify client-directed reminders
    sent: { type: Boolean, default: false },
    sentAt: { type: Date },
    emailStatus: {
      type: String,
      enum: ["queued", "sent", "failed"],
      default: "queued",
    },
    deleted: { type: Boolean, default: false }, // ✅ Soft delete
  },
  { timestamps: true } // ✅ createdAt and updatedAt
);

module.exports =
  mongoose.models.Reminder || mongoose.model("Reminder", ReminderSchema);
