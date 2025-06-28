const express = require("express");
const router = express.Router();

const {
  getAllQuotes,
  createPersonalQuote,
  createBusinessQuote,
  finalizeQuote, // ✅ don't forget this
} = require("../controllers/quoteController");


const authenticateToken = require("../middleware/authMiddleware");

// Routes
router.get("/", authenticateToken, getAllQuotes);
router.post("/personal", authenticateToken, createPersonalQuote);
router.post("/business", authenticateToken, createBusinessQuote);
router.put("/:id/finalize", authenticateToken, finalizeQuote); // ✅ Add this

module.exports = router;
