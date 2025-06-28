const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  // Core info
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  username: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
  },
  password: { type: String, required: true },
  userType: {
    type: String,
    required: true,
    enum: ["client", "employee", "owner"],
    default: "client",
  },

  // Optional fields for quoting
  dob: String,
  phone: String,
  address: String,
  driversLicense: String,
  employmentStatus: String,
  companyName: String,
  maritalStatus: String,
  children: [String],
  vehicleYear: String,
  vehicleVIN: String,
  coverageType: String,
  homeStatus: { type: String, enum: ["own", "rent"] },
  hasCostcoCard: Boolean,

  // Quote history references
  personalQuotes: [
    { type: mongoose.Schema.Types.ObjectId, ref: "PersonalQuote" },
  ],
  businessQuotes: [
    { type: mongoose.Schema.Types.ObjectId, ref: "BusinessQuote" },
  ],

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Middleware: Auto-update 'updatedAt' on save
UserSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("User", UserSchema);
