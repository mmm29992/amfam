const mongoose = require("mongoose");

const ScriptSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    english: { type: String, required: true },
    translation: { type: String, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Script", ScriptSchema);
