const mongoose = require("mongoose");

const QuoteUploadSchema = new mongoose.Schema({
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
  quoteFileUrl: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  quoteType: {
    type: String,
    enum: ["Auto", "Home", "Life", "Renters", "Business", "Other"], // or whatever categories you want
    required: true,
  },
});

module.exports = mongoose.model("QuoteUpload", QuoteUploadSchema);
