const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const authenticateToken = require("../middleware/authMiddleware");

const {
  uploadPolicyPdf,
  getAllPolicies,
  downloadPolicyPdf,
} = require("../controllers/policyController");

const Policy = require("../models/PolicyUpload");
const { v2: cloudinary } = require("cloudinary");

// ✅ Handle long Cloudinary public_ids like client_policies/abc123.pdf
router.get("/download/*", downloadPolicyPdf);

// ---- Multer temp storage (PDF-only) ----
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

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

// ---- DELETE /policies/:id (staff only) ----
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== "employee" && req.user.userType !== "owner") {
      return res
        .status(403)
        .json({ message: "Not authorized to delete policies" });
    }

    const policy = await Policy.findById(req.params.id);
    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    // Derive public_id from URL (matches your Quotes approach)
    const publicId = policy.policyFileUrl.split("/").pop()?.split(".")[0];

    if (publicId) {
      await cloudinary.uploader.destroy(`client_policies/${publicId}`, {
        resource_type: "raw",
      });
    }

    await Policy.findByIdAndDelete(req.params.id);
    res.json({ message: "Policy deleted successfully" });
  } catch (err) {
    console.error("Delete policy error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ---- GET /policies/me (client: their own; notes hidden) ----
router.get("/me", authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== "client") {
      return res.status(403).json({ message: "Access denied." });
    }

    const myPolicies = await Policy.find({ clientId: req.user.userId })
      .sort({
        createdAt: -1,
      })
      .lean();

    // strip notes for clients
    const safe = myPolicies.map(({ notes, ...rest }) => rest);
    res.json(safe);
  } catch (err) {
    console.error("Failed to fetch client policies:", err);
    res.status(500).json({ message: "Server error." });
  }
});

// ---- GET /policies (role-aware; notes hidden for clients) ----
router.get("/", authenticateToken, getAllPolicies);

// ---- POST /policies/upload (staff only) ----
router.post(
  "/upload",
  authenticateToken,
  upload.single("policyFile"),
  uploadPolicyPdf
);

module.exports = router;
