// internal/processDueNow.js
const Reminder = require("../models/Reminder");
const createTransporter = require("../utils/emailTransporter");

const transporter =
  typeof createTransporter === "function"
    ? createTransporter(
        (process.env.EMAIL_PROVIDER || "gmail").toLowerCase(),
        process.env.EMAIL_USER,
        process.env.EMAIL_PASS
      )
    : createTransporter; // if your module already exports an instance

async function processDueNow() {
  const now = new Date();

  // Only grab reminders we should email and that are due
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
        from: process.env.EMAIL_USER, // real sender
        to: r.targetEmail,
        subject: r.emailSubject || `Reminder: ${r.title}`,
        text: r.emailBody || r.message || "",
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
