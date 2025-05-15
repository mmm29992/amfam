const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth"); // Import the auth routes

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors()); // Enable CORS for cross-origin requests
app.use(express.json()); // Parse JSON bodies

// Use the auth routes for "/api/auth"
app.use("/api/auth", authRoutes);

// Connect to MongoDB using the environment variable
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
