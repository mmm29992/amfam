// utils/emailTransporter.js
const axios = require("axios");

let nodemailer = null; // lazy require only if/when we use SMTP

function createTransporter() {
  const driver = (process.env.MAIL_DRIVER || "brevo").toLowerCase();

  if (driver === "brevo") {
    const apiKey = process.env.BREVO_API_KEY;
    // 🔧 unify envs; keep safe fallbacks
    const fromEmail =
      process.env.MAIL_FROM_EMAIL ||
      process.env.EMAIL_FROM_ADDRESS ||
      process.env.EMAIL_USER;
    const fromName =
      process.env.MAIL_FROM_NAME ||
      process.env.EMAIL_FROM_NAME ||
      "Notifications";

    if (!apiKey || !fromEmail) {
      throw new Error(
        "Brevo not configured. Set BREVO_API_KEY and MAIL_FROM_EMAIL (or EMAIL_USER)."
      );
    }

    return {
      // keep compatibility with code that calls verify()
      async verify() {
        return true; // Brevo HTTP doesn't need a handshake
      },

      /**
       * sendMail({ from, to, cc, bcc, subject, text, html, replyTo, attachments })
       */
      async sendMail(opts = {}) {
        const {
          from,
          to,
          cc,
          bcc,
          subject,
          text,
          html,
          replyTo,
          attachments, // [{ filename, content(base64 or string) }]
        } = opts;

        const toList = normAddresses(to);
        if (!toList.length) throw new Error("sendMail: 'to' is required.");

        const ccList = normAddresses(cc);
        const bccList = normAddresses(bcc);

        const sender = parseFrom(from) || { email: fromEmail, name: fromName };
        const brevoAttachments = Array.isArray(attachments)
          ? attachments.map(mapAttachment).filter(Boolean)
          : undefined;

        const payload = {
          sender, // { email, name }
          to: toList, // [{ email, name? }]
          cc: ccList?.length ? ccList : undefined,
          bcc: bccList?.length ? bccList : undefined,
          subject,
          textContent: text || undefined,
          htmlContent: html || undefined,
          replyTo: parseAddress(replyTo) || undefined, // { email, name? }
          attachment: brevoAttachments, // [{ name, content(base64) }]
        };

        try {
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

          return {
            messageId:
              res.data?.messageId || res.data?.messageIds?.[0] || "brevo",
            response: "OK",
          };
        } catch (err) {
          // Surface useful details
          const status = err?.response?.status;
          const data = err?.response?.data;
          const msg =
            data?.message ||
            data?.errors?.[0]?.message ||
            err?.message ||
            String(err);
          const short = typeof msg === "string" ? msg.slice(0, 300) : "Error";
          throw new Error(
            `Brevo sendMail failed${
              status ? ` (HTTP ${status})` : ""
            }: ${short}`
          );
        }
      },
    };
  }

  // === SMTP fallback via Nodemailer ===
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

  const transport = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  return transport;
}

/* ---------- helpers ---------- */

function normAddresses(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.flatMap(normAddresses);
  if (typeof val === "string") {
    // support "Name <email@x.com>, other@x.com"
    return val
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(parseMailboxString)
      .filter(Boolean);
  }
  if (val && typeof val === "object") {
    const parsed = parseAddress(val);
    return parsed ? [parsed] : [];
  }
  return [];
}

function parseAddress(v) {
  if (!v) return null;
  if (typeof v === "string") return parseMailboxString(v);
  const email = v.address || v.email;
  const name = v.name;
  if (!email) return null;
  return name ? { email, name } : { email };
}

function parseMailboxString(s) {
  const m = s.match(/^\s*(?:"?([^"]*)"?\s*)?<([^>]+)>\s*$/); // "Name" <email>
  if (m) {
    const name = m[1]?.trim();
    const email = m[2]?.trim();
    return email ? (name ? { email, name } : { email }) : null;
  }
  return { email: s };
}

function parseFrom(from) {
  if (!from) return null;
  const a = parseAddress(from);
  return a ? a : null;
}

function mapAttachment(a) {
  if (!a) return null;
  const name = a.filename || a.name || "attachment";
  if (a.content) {
    let base64;
    try {
      // if it's already base64, this will still work for most cases; otherwise convert
      const looksBase64 = /^[A-Za-z0-9+/=\r\n]+$/.test(a.content);
      base64 = looksBase64
        ? a.content
        : Buffer.from(a.content).toString("base64");
    } catch {
      base64 = Buffer.from(String(a.content)).toString("base64");
    }
    return { name, content: base64 };
  }
  // (Optional) Support a.path by reading file — skipped to avoid fs in serverless.
  return null;
}

module.exports = createTransporter;
