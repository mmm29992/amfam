// models/OwnerCode.js
const mongoose = require("mongoose");

const ownerCodeSchema = new mongoose.Schema({
  code: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("OwnerCode", ownerCodeSchema);
