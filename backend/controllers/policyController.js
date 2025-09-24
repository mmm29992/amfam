const cloudinary = require("../utils/cloudinary");
const PolicyUpload = require("../models/PolicyUpload");
const axios = require("axios");
const crypto = require("crypto");
const { cloud_name, api_key, api_secret } = process.env;

// 🔽 DOWNLOAD POLICY PDF
// Route: router.get("/download/*", downloadPolicyPdf)
const downloadPolicyPdf = async (req, res) => {
  // e.g., /policies/download/client_policies/1727134000-myfile.pdf
  const publicId = req.params[0]; // <-- wildcard segment after /download/

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
      params: { public_id: publicId, timestamp, signature, api_key },
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
    console.error("Policy download error:", err.response?.data || err.message);
    return res.status(500).json({ message: "Could not download file." });
  }
};

// 🔽 UPLOAD POLICY PDF (staff only)
const uploadPolicyPdf = async (req, res) => {
  try {
    const { clientId, notes, policyType } = req.body;

    if (!req.file)
      return res.status(400).json({ message: "No file uploaded." });
    if (!clientId)
      return res.status(400).json({ message: "Client ID is required." });
    if (!policyType)
      return res.status(400).json({ message: "Policy type is required." });

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "client_policies",
      resource_type: "raw",
      type: "upload",
      access_mode: "public",
    });

    if (!result.secure_url.endsWith(".pdf")) {
      return res.status(400).json({ message: "Uploaded file is not a PDF." });
    }

    const newPolicy = new PolicyUpload({
      clientId,
      uploadedBy: req.user.userId,
      policyFileUrl: result.secure_url,
      notes: notes || "", // staff-only (hidden for clients in GET)
      policyType,
    });

    await newPolicy.save();

    res.status(201).json({
      message: "Policy uploaded successfully.",
      policy: newPolicy,
    });
  } catch (err) {
    console.error("Upload policy PDF error:", err);
    res.status(500).json({ message: "Failed to upload policy." });
  }
};

// 🔽 GET ALL POLICIES (clients see only their own; notes stripped)
const getAllPolicies = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userType = req.user.userType;

    let filter = {};
    if (userType === "client") {
      filter = { clientId: userId };
    } else {
      // employees/owner can optionally filter by ?clientId=
      if (req.query.clientId) filter.clientId = req.query.clientId;
    }

    const policies = await PolicyUpload.find(filter)
      .sort({ createdAt: -1 })
      .populate("uploadedBy", "firstName lastName username email")
      .populate("clientId", "firstName lastName username email")
      .lean();

    if (userType === "client") {
      // hide notes from clients
      const safe = policies.map(({ notes, ...rest }) => rest);
      return res.status(200).json(safe);
    }

    res.status(200).json(policies);
  } catch (err) {
    console.error("Failed to fetch policies:", err);
    res.status(500).json({ message: "Server error while fetching policies" });
  }
};

module.exports = {
  uploadPolicyPdf,
  getAllPolicies,
  downloadPolicyPdf,
};
