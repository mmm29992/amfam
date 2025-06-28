const mongoose = require("mongoose");

const BusinessQuoteSchema = new mongoose.Schema({
  // Business info
  businessName: { type: String, required: true, trim: true },
  businessAddress: { type: String, required: true },
  businessStructure: { type: String, required: true },
  ein: { type: String, required: true },

  // Owner info
  ownerFullName: { type: String, required: true },
  ownerAddress: { type: String, required: true },
  ownerPhone: { type: String, required: true },
  ownerDob: { type: String, required: true },
  ownerMaritalStatus: { type: String },
  ownerEmail: { type: String, required: true },

  // Policy info
  coverageType: { type: String }, // e.g., General Liability, Business Owner's Policy, etc.

  // 🔐 Access control
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  forClientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional

  // ✏️ Final quote (AI generated + pasted)
  finalQuoteText: { type: String },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("BusinessQuote", BusinessQuoteSchema);
