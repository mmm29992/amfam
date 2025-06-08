const mongoose = require("mongoose");

const employeeCodeSchema = new mongoose.Schema({
  code: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("EmployeeCode", employeeCodeSchema);
