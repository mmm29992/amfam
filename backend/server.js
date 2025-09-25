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
const policiesRoutes = require("./routes/policies");


const app = express();
const server = http.createServer(app); // 🧠 Use this instead of app.listen
const PORT = process.env.PORT || 5001;

// ───── Middleware ─────
// ───── Middleware ─────

// ✅ Put trust proxy FIRST so Secure cookies stick behind Render/Proxy
app.set("trust proxy", 1);

// 🔁 Reusable CORS options (same logic for app, OPTIONS, and Socket.io)
const allowedOrigins = ["http://localhost:3000", "https://amfam.vercel.app"];
const vercelPreviewRegex = /\.vercel\.app$/;

const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true); // curl/Postman or server-to-server
    if (allowedOrigins.includes(origin) || vercelPreviewRegex.test(origin)) {
      return cb(null, true);
    }
    return cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
};

// ✅ Apply CORS BEFORE parsers, and mirror it for preflights
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(cookieParser());
app.use(express.json());


// ───── Routes ─────
app.use("/api/auth", authRoutes);
app.use("/api/scripts", scriptsRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/checklist", checklistRoutes);
app.use("/api/quotes", quoteRoutes);
app.use("/api/conversations", conversationRoutes); // 🆕 Add this
app.use("/api/policies", policiesRoutes); // ← ADD THIS


// ───── MongoDB ─────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// ───── Socket.io Setup ─────
const io = new Server(server, {
  cors: {
    ...corsOptions, // ✅ reuse the same policy as the app
    methods: ["GET", "POST", "PATCH"],
  },
});



const userSocketMap = new Map(); // optional: for private messages if needed

io.on("connection", (socket) => {
  console.log("⚡️ Socket connected:", socket.id);

  socket.on("register", (userId) => {
    userSocketMap.set(userId, socket.id);
  });

  socket.on("joinConversation", (convoId) => {
    socket.join(`convo:${convoId}`);
  });

  socket.on("sendMessage", ({ convoId, message }) => {
    io.to(`convo:${convoId}`).emit("receiveMessage", message);
  });

  socket.on("typing", ({ convoId, userId, isTyping }) => {
    socket.to(`convo:${convoId}`).emit("typingStatus", { userId, isTyping });
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
// require("./jobs/sendReminders");
const { processDueNow } = require("./internal/processDueNow");

// --- Health check ---
app.get("/api/health", (_req, res) => res.status(200).json({ ok: true }));

// ⚠️ Open endpoint (no token). Includes a tiny rate limiter.
let __lastRunDueAt = 0;
app.post("/internal/run-due", async (req, res) => {
  const now = Date.now();
  // allow at most ~1 call per 25s to avoid spam / accidental loops
  if (now - __lastRunDueAt < 25_000) {
    return res.status(429).json({ ok: false, error: "too_soon" });
  }
  __lastRunDueAt = now;

  try {
    const result = await processDueNow();
    return res.json({ ok: true, ...result });
  } catch (e) {
    console.error("run-due error:", e);
    return res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
});



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
