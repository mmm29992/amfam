require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
const nodemailer = require("nodemailer");

// Routes
const authRoutes = require("./routes/auth");
const scriptsRoutes = require("./routes/scripts");
const reminderRoutes = require("./routes/reminders");
const checklistRoutes = require("./routes/checklist");
const quoteRoutes = require("./routes/quotes");
const conversationRoutes = require("./routes/conversations");
const policiesRoutes = require("./routes/policies");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5001;

/* ---------- Middleware ---------- */
app.set("trust proxy", 1);
const allowedOrigins = ["http://localhost:3000", "https://amfam.vercel.app"];
const vercelPreviewRegex = /\.vercel\.app$/;

const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin) || vercelPreviewRegex.test(origin)) {
      return cb(null, true);
    }
    return cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

/* ---------- API Routes ---------- */
app.use("/api/auth", authRoutes);
app.use("/api/scripts", scriptsRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/checklist", checklistRoutes);
app.use("/api/quotes", quoteRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/policies", policiesRoutes);

/* ---------- MongoDB ---------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

/* ---------- Socket.io ---------- */
const io = new Server(server, {
  cors: { ...corsOptions, methods: ["GET", "POST", "PATCH"] },
});

const userSocketMap = new Map();
io.on("connection", (socket) => {
  console.log("⚡️ Socket connected:", socket.id);
  socket.on("register", (userId) => userSocketMap.set(userId, socket.id));
  socket.on("joinConversation", (convoId) => socket.join(`convo:${convoId}`));
  socket.on("sendMessage", ({ convoId, message }) => {
    io.to(`convo:${convoId}`).emit("receiveMessage", message);
  });
  socket.on("typing", ({ convoId, userId, isTyping }) => {
    socket.to(`convo:${convoId}`).emit("typingStatus", { userId, isTyping });
  });
  socket.on("disconnect", () => {
    for (const [userId, sId] of userSocketMap.entries()) {
      if (sId === socket.id) userSocketMap.delete(userId);
    }
  });
});
app.set("io", io);

/* ---------- Cron endpoints ---------- */
const { processDueNow } = require("./internal/processDueNow");
app.get("/api/health", (_req, res) => res.status(200).json({ ok: true }));

let __lastRunDueAt = 0;
app.post("/internal/run-due", async (req, res) => {
  const now = Date.now();
  if (now - __lastRunDueAt < 25_000)
    return res.status(429).json({ ok: false, error: "too_soon" });
  __lastRunDueAt = now;
  try {
    const result = await processDueNow();
    res.json({ ok: true, ...result });
  } catch (e) {
    console.error("run-due error:", e);
    res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
});

/* ---------- SMTP quick tests (TEMP) ---------- */
function makeTransport() {
  const port = Number(process.env.SMTP_PORT || 587); // 587 STARTTLS, 465 SSL
  const secure = port === 465;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port,
    secure,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    logger: true,
    debug: true,
  });
}

app.get("/_smtp/verify", async (_req, res) => {
  try {
    const transporter = makeTransport();
    await transporter.verify();
    res.json({ ok: true, msg: "SMTP reachable & creds accepted" });
  } catch (e) {
    res
      .status(500)
      .json({ ok: false, msg: e?.message || String(e), code: e?.code || null });
  }
});

app.get("/_smtp/send", async (_req, res) => {
  try {
    const transporter = makeTransport();
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "SMTP test from Render",
      text: "If you received this, SMTP works from the server.",
    });
    res.json({ ok: true, msg: "Sent" });
  } catch (e) {
    res
      .status(500)
      .json({ ok: false, msg: e?.message || String(e), code: e?.code || null });
  }
});

/* ---------- Fallback/Error handlers (LAST) ---------- */
app.use((req, res) => res.status(404).json({ message: "Route not found" }));
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Server error" });
});

/* ---------- Start server (ONCE) ---------- */
server.listen(PORT, () => {
  console.log(`🚀 Server with Socket.io running on port ${PORT}`);
});
