require("dotenv").config({ path: __dirname + "/../.env" }); // force load .env

const mongoose = require("mongoose");

// Debug print to validate env variables
console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "✅ loaded" : "❌ missing");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connection successful");
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
  });
