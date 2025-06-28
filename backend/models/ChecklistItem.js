const mongoose = require("mongoose");
const { Schema } = mongoose;

const ChecklistSchema = new Schema(
  {
    text: { type: String, required: true },
    deadline: { type: Date },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    deleted: { type: Boolean, default: false },
    creatorId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // Priority Category & Subcategory
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
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Checklist || mongoose.model("Checklist", ChecklistSchema);
