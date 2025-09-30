// internal/processDueNow.js
const Reminder = require("../models/Reminder");
const createTransporter = require("../utils/emailTransporter");

// New: helper reads env (MAIL_DRIVER/BREVO_API_KEY/EMAIL_FROM_*)
const transporter = createTransporter();

async function processDueNow() {
  const now = new Date();

  const due = await Reminder.find({
    deleted: false,
    sendEmail: true,
    sent: false,
    scheduledTime: { $lte: now },
  })
    .sort({ scheduledTime: 1 })
    .limit(200);

  let attempted = 0;
  let sentCount = 0;
  let failed = 0;

  for (const r of due) {
    attempted++;

    if (!r.targetEmail) {
      failed++;
      await Reminder.updateOne(
        { _id: r._id },
        { $set: { emailStatus: "failed", lastError: "Missing targetEmail" } }
      );
      continue;
    }

    try {
      await transporter.sendMail({
        from: {
          email: process.env.EMAIL_FROM_ADDRESS,
          name: process.env.EMAIL_FROM_NAME || "American Family Insurance",
        },
        to: r.targetEmail,
        subject: r.emailSubject || `Reminder: ${r.title}`,
        text: r.emailBody || r.message || "",
        // html: optional richer body if you store it on the reminder:
        // html: r.emailHtml || undefined,
      });

      await Reminder.updateOne(
        { _id: r._id },
        {
          $set: { sent: true, sentAt: new Date(), emailStatus: "sent" },
          $unset: { lastError: "" },
        }
      );
      sentCount++;
    } catch (err) {
      failed++;
      await Reminder.updateOne(
        { _id: r._id },
        {
          $set: {
            emailStatus: "failed",
            lastError: err?.message || String(err),
          },
        }
      );
    }
  }

  return { now, found: due.length, attempted, sent: sentCount, failed };
}

module.exports = { processDueNow };
