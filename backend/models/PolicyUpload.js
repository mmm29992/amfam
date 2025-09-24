// models/PolicyUpload.js
const mongoose = require("mongoose");

const PolicyUploadSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  policyFileUrl: {
    type: String,
    required: true,
  },
  notes: {
    type: String, // staff-only (we'll strip it in GETs for clients)
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  policyType: {
    type: String,
    enum: ["Auto", "Home", "Life", "Renters", "Business", "Other"],
    required: true,
  },
});

module.exports = mongoose.model("PolicyUpload", PolicyUploadSchema);
