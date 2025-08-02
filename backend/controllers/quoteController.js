const cloudinary = require("../utils/cloudinary");
const QuoteUpload = require("../models/QuoteUpload");
const axios = require("axios");
const crypto = require("crypto");
const { cloud_name, api_key, api_secret } = process.env;

// 🔽 DOWNLOAD QUOTE PDF
const downloadQuotePdf = async (req, res) => {
  const { publicId } = req.params[0]; // e.g. "client_quotes/abc123.pdf"

  if (!publicId) {
    return res.status(400).json({ message: "Missing public ID" });
  }

  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = crypto
      .createHash("sha1")
      .update(`public_id=${publicId}&timestamp=${timestamp}${api_secret}`)
      .digest("hex");

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloud_name}/raw/download`;

    const response = await axios.post(cloudinaryUrl, null, {
      params: {
        public_id: publicId,
        timestamp,
        signature,
        api_key,
      },
    });

    const downloadUrl = response.data.secure_url;

    const fileStream = await axios.get(downloadUrl, { responseType: "stream" });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${publicId.split("/").pop()}"`
    );
    res.setHeader("Content-Type", "application/pdf");

    fileStream.data.pipe(res);
  } catch (err) {
    console.error("Download error:", err.response?.data || err.message);
    return res.status(500).json({ message: "Could not download file." });
  }
};

// 🔽 UPLOAD QUOTE PDF
const uploadQuotePdf = async (req, res) => {
  try {
    const { clientId, notes, quoteType } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    if (!clientId) {
      return res.status(400).json({ message: "Client ID is required." });
    }

    if (!quoteType) {
      return res.status(400).json({ message: "Quote type is required." });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "client_quotes",
      resource_type: "raw",
      type: "upload",
      access_mode: "public",
    });

    console.log("📎 Uploaded PDF URL:", result.secure_url);
    console.log("📄 Full Cloudinary response:", result);

    if (!result.secure_url.endsWith(".pdf")) {
      return res.status(400).json({ message: "Uploaded file is not a PDF." });
    }

    const newQuote = new QuoteUpload({
      clientId,
      uploadedBy: req.user.userId,
      quoteFileUrl: result.secure_url,
      notes: notes || "",
      quoteType,
    });

    await newQuote.save();

    res.status(201).json({
      message: "Quote uploaded successfully.",
      quote: newQuote,
    });
  } catch (err) {
    console.error("Upload quote PDF error:", err);
    res.status(500).json({ message: "Failed to upload quote." });
  }
};


// 🔽 GET ALL QUOTES
const getAllQuotes = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userType = req.user.userType;

    let filter = {};
    if (userType === "client") {
      filter = { clientId: userId };
    }

    const quotes = await QuoteUpload.find(filter)
      .sort({ createdAt: -1 })
      .populate("uploadedBy", "firstName lastName username email")
      .populate("clientId", "firstName lastName username email");

    res.status(200).json(quotes);
  } catch (err) {
    console.error("Failed to fetch uploaded quotes:", err);
    res.status(500).json({ message: "Server error while fetching quotes" });
  }
};

// 🔁 EXPORT EVERYTHING
module.exports = {
  uploadQuotePdf,
  getAllQuotes,
  downloadQuotePdf, // ✅ now properly defined
};
