// backend/config/db.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables

const connectDB = async () => {
  try {
    // Connect to MongoDB using Mongoose (no need for useNewUrlParser or useUnifiedTopology anymore)
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit process with failure code
  }
};

module.exports = connectDB;
