// utils/emailTransporter.js
const nodemailer = require("nodemailer");

function createTransporter() {
  // If explicit SMTP host is provided, prefer that (works for Brevo, Mailgun, SendGrid, etc.)
  const host = process.env.SMTP_HOST; // e.g. "smtp-relay.brevo.com"
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = port === 465; // 465 = SSL/TLS, 587/2525 = STARTTLS
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
  }

  // Fallback: legacy provider switch (kept for convenience)
  const provider = (process.env.EMAIL_PROVIDER || "").toLowerCase();
  if (provider === "gmail") {
    return nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user, pass },
    });
  }
  if (provider === "outlook") {
    return nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      secure: false,
      auth: { user, pass },
    });
  }
  if (provider === "yahoo") {
    return nodemailer.createTransport({
      host: "smtp.mail.yahoo.com",
      port: 465,
      secure: true,
      auth: { user, pass },
    });
  }

  throw new Error(
    "SMTP not configured. Set SMTP_HOST/SMTP_PORT/EMAIL_USER/EMAIL_PASS."
  );
}

module.exports = createTransporter;
