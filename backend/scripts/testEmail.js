require("dotenv").config({ path: __dirname + "/../.env" });

const nodemailer = require("nodemailer");

// Debug: log env vars
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "✅ loaded" : "❌ missing");

// Set up transporter with visible config
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((err, success) => {
  if (err) {
    console.error("❌ Email transporter config error:", err.message);
  } else {
    console.log("✅ Email transporter is ready");
  }
});

// Attempt to send
transporter.sendMail(
  {
    from: `"Reminder Test" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: "Test Email",
    text: "This is a test email from your reminder system.",
  },
  (err, info) => {
    if (err) {
      console.error("❌ Email send failed:", err.message);
    } else {
      console.log("✅ Email sent:", info.response);
    }
  }
);
