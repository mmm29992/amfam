const mongoose = require("mongoose");
const { Schema } = mongoose;

const ReminderSchema = new Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    scheduledTime: { type: Date, required: true },
    creatorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },

    userType: {
      type: String,
      enum: ["client", "employee", "owner"],
      required: true,
    },

    // Category and Subcategory Labels
    category: {
      type: String,
      enum: [
        "Quote Follow Up",
        "Life",
        "Commercial",
        "PL Home",
        "PL Auto",
        "PL Renters",
      ],
      required: true,
    },
    subcategory: {
      type: String,
      enum: [
        "Quotes Follow Up",
        "No Pay",
        "Cancel Status",
        "Cancel",
        "No Renewal",
        "Discount Remove",
        "Documents Needed",
      ],
      required: true,
    },

    // Email
    sendEmail: { type: Boolean, default: false },
    targetEmail: { type: String },
    emailSubject: { type: String },
    emailBody: { type: String },

    // Flags
    forClient: { type: Boolean, default: false },
    sent: { type: Boolean, default: false },
    sentAt: { type: Date },
    emailStatus: {
      type: String,
      enum: ["queued", "sent", "failed"],
      default: "queued",
    },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Reminder || mongoose.model("Reminder", ReminderSchema);
