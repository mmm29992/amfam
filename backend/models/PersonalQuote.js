const mongoose = require("mongoose");

const PersonalQuoteSchema = new mongoose.Schema({
  // Quote type (e.g., personal auto, home, renters, life)
  quoteType: {
    type: String,
    enum: ["pl_auto", "pl_home", "pl_renters", "life"],
    required: true,
  },

  // Core info
  fullName: { type: String, required: true, trim: true },
  phone: { type: String },
  email: {
    type: String,
    required: true,
    match: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
  },
  dob: { type: String },
  driversLicense: { type: String },
  employmentStatus: { type: String },
  companyName: { type: String },
  address: { type: String },
  maritalStatus: { type: String },
  children: [{ type: String }],

  // Vehicle-related (for pl_auto)
  vehicleYear: { type: String },
  vehicleVIN: { type: String },

  // Coverage-related
  coverageType: { type: String },

  // Home-related (for pl_home)
  homeStatus: { type: String, enum: ["own", "rent"] },
  hasCostcoCard: { type: Boolean, default: false },

  // 🔐 Access control
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  forClientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  // ✏️ Final quote
  finalQuoteText: { type: String },

  // 🕓 Timestamps
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PersonalQuote", PersonalQuoteSchema);
