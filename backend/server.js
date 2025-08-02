require("dotenv").config(); // ✅ FIRST LINE
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");

const authRoutes = require("./routes/auth");
const scriptsRoutes = require("./routes/scripts");
const reminderRoutes = require("./routes/reminders");
const checklistRoutes = require("./routes/checklist");
const quoteRoutes = require("./routes/quotes");
const conversationRoutes = require("./routes/conversations"); // 🆕 Your messaging routes

const app = express();
const server = http.createServer(app); // 🧠 Use this instead of app.listen
const PORT = process.env.PORT || 5001;

// ───── Middleware ─────
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000", // Frontend
    credentials: true,
  })
);

// ───── Routes ─────
app.use("/api/auth", authRoutes);
app.use("/api/scripts", scriptsRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/checklist", checklistRoutes);
app.use("/api/quotes", quoteRoutes);
app.use("/api/conversations", conversationRoutes); // 🆕 Add this

// ───── MongoDB ─────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// ───── Socket.io Setup ─────
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PATCH"],
    credentials: true,
  },
});

const userSocketMap = new Map(); // optional: for private messages if needed

io.on("connection", (socket) => {
  console.log("⚡️ Socket connected:", socket.id);

  socket.on("register", (userId) => {
    userSocketMap.set(userId, socket.id);
  });

  socket.on("joinConversation", (convoId) => {
    socket.join(convoId);
  });

  socket.on("sendMessage", ({ convoId, message }) => {
    io.to(convoId).emit("receiveMessage", message);
  });

  socket.on("typing", ({ convoId, userId, isTyping }) => {
    socket.to(convoId).emit("typingStatus", { userId, isTyping });
  });

  socket.on("disconnect", () => {
    console.log("⚠️ Socket disconnected:", socket.id);
    for (const [userId, sId] of userSocketMap.entries()) {
      if (sId === socket.id) userSocketMap.delete(userId);
    }
  });
});

// Attach to app (optional if you want to use io inside routes)
app.set("io", io);

// ───── Cron Jobs ─────
require("./jobs/sendReminders");

// ───── Fallback/Error Handling ─────
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Server error" });
});

// ───── Start Server ─────
server.listen(PORT, () => {
  console.log(`🚀 Server with Socket.io running on port ${PORT}`);
});
