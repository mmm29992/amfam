const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const authenticateToken = require("../middleware/authMiddleware");
const {
  uploadQuotePdf,
  getAllQuotes,
  downloadQuotePdf, // 👈 make sure this is exported from controller
} = require("../controllers/quoteController");
const Quote = require("../models/QuoteUpload"); // or wherever your Quote model lives
const { v2: cloudinary } = require("cloudinary");


// Fix for long public_id like client_quotes/abc123.pdf
router.get("/download/*", downloadQuotePdf);

// Storage for temporary upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

// Strict PDF check
const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;

    if (ext !== ".pdf" || mime !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed."), false);
    }

    cb(null, true);
  },
});

// DELETE /quotes/:id
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    // Optional: check role
    if (req.user.userType !== "employee" && req.user.userType !== "owner") {
      return res
        .status(403)
        .json({ message: "Not authorized to delete quotes" });
    }

    const quote = await Quote.findById(req.params.id);
    if (!quote) {
      return res.status(404).json({ message: "Quote not found" });
    }

    // Extract public_id from Cloudinary URL
    const publicId = quote.quoteFileUrl.split("/").pop()?.split(".")[0];

    // Delete from Cloudinary
    if (publicId) {
      await cloudinary.uploader.destroy(`client_quotes/${publicId}`, {
        resource_type: "raw",
      });
    }

    // Delete from MongoDB
    await Quote.findByIdAndDelete(req.params.id);

    res.json({ message: "Quote deleted successfully" });
  } catch (err) {
    console.error("Delete quote error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/me", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== "client") {
      return res.status(403).json({ message: "Access denied." });
    }

    const clientQuotes = await Quote.find({ clientId: req.user.userId }).sort({
      createdAt: -1,
    });

    res.json(clientQuotes);
  } catch (err) {
    console.error("Failed to fetch client quotes:", err);
    res.status(500).json({ message: "Server error." });
  }
});




// Routes
router.get("/", authenticateToken, getAllQuotes);

router.post(
  "/upload",
  authenticateToken,
  upload.single("quoteFile"),
  uploadQuotePdf
);

module.exports = router;
