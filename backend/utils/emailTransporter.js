// utils/emailTransporter.js
const axios = require("axios");

let nodemailer = null; // lazy require only if/when we use SMTP

/**
 * Create a mail transporter that exposes a Nodemailer-like { sendMail() } API.
 * Driver is selected via env:
 *   - MAIL_DRIVER=brevo  -> Brevo HTTP API (recommended on Render free tier)
 *   - MAIL_DRIVER=smtp   -> Plain SMTP via Nodemailer
 */
function createTransporter() {
  const driver = (process.env.MAIL_DRIVER || "brevo").toLowerCase();

  if (driver === "brevo") {
    const apiKey = process.env.BREVO_API_KEY;
    const fromEmail = process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER; // fallback
    const fromName = process.env.EMAIL_FROM_NAME || "Notifications";

    if (!apiKey || !fromEmail) {
      throw new Error(
        "Brevo not configured. Set BREVO_API_KEY and EMAIL_FROM_ADDRESS (or EMAIL_USER)."
      );
    }

    // Minimal Nodemailer-like wrapper
    return {
      /**
       * sendMail({ from, to, cc, bcc, subject, text, html, attachments })
       */
      async sendMail(opts) {
        const {
          from,
          to,
          cc,
          bcc,
          subject,
          text,
          html,
          attachments, // optional: [{ filename, content(base64 or string), path }]
        } = opts || {};

        // Normalize recipients to Brevo's expected shape
        const toList = normAddresses(to);
        const ccList = normAddresses(cc);
        const bccList = normAddresses(bcc);

        // Sender: allow overriding, otherwise use env defaults
        const sender = parseAddress(from) || {
          email: fromEmail,
          name: fromName,
        };

        // Map basic attachments to Brevo (base64 recommended)
        const brevoAttachments = Array.isArray(attachments)
          ? attachments.map((a) => mapAttachment(a)).filter(Boolean)
          : undefined;

        const payload = {
          sender,
          to: toList,
          cc: ccList?.length ? ccList : undefined,
          bcc: bccList?.length ? bccList : undefined,
          subject,
          textContent: text || undefined,
          htmlContent: html || undefined,
          attachment: brevoAttachments,
        };

        const res = await axios.post(
          "https://api.brevo.com/v3/smtp/email",
          payload,
          {
            headers: {
              "api-key": apiKey,
              "Content-Type": "application/json",
            },
            timeout: 15000,
          }
        );

        // Mimic Nodemailer-ish response
        return {
          messageId: res.data?.messageId || res.data?.messageId?.[0] || "brevo",
        };
      },
    };
  }

  // === SMTP fallback (uses Nodemailer) ===
  if (!nodemailer) nodemailer = require("nodemailer");

  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 587); // 587 STARTTLS, 465 SSL
  const secure = port === 465;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      "SMTP not configured. Set SMTP_HOST/SMTP_PORT/EMAIL_USER/EMAIL_PASS or use MAIL_DRIVER=brevo."
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

/* ---------- helpers ---------- */

function normAddresses(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.flatMap(normAddresses);
  if (typeof val === "string")
    return val
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((email) => ({ email }));
  if (val && typeof val === "object") {
    // nodemailer style: { address, name } or { email, name }
    const parsed = parseAddress(val);
    return parsed ? [parsed] : [];
  }
  return [];
}

function parseAddress(v) {
  if (!v) return null;
  if (typeof v === "string") return { email: v };
  // nodemailer formats
  const email = v.address || v.email;
  const name = v.name;
  if (!email) return null;
  return name ? { email, name } : { email };
}

function mapAttachment(a) {
  if (!a) return null;
  // Brevo expects { name, content } where content is base64
  // If caller already passed base64 in content, use it; otherwise try to convert string to base64.
  if (a.content) {
    const isBase64 =
      /^[A-Za-z0-9+/=]+$/.test(a.content) && a.content.length % 4 === 0;
    const base64 = isBase64
      ? a.content
      : Buffer.from(a.content).toString("base64");
    return { name: a.filename || a.name || "attachment", content: base64 };
  }
  // If a.path was provided, you could read it here — omitted to avoid fs in serverless.
  return null;
}

module.exports = createTransporter;
