const cron = require("node-cron");
const createTransporter = require("../utils/emailTransporter");
const Reminder = require("../models/Reminder");
require("dotenv").config();

const transporter =
  typeof createTransporter === "function"
    ? createTransporter(
        (process.env.EMAIL_PROVIDER || "gmail").toLowerCase(),
        process.env.EMAIL_USER,
        process.env.EMAIL_PASS
      )
    : createTransporter;

// optional: prove SMTP is ready
(async () => {
  try {
    await transporter.verify();
    console.log("📮 SMTP ready");
  } catch (e) {
    console.error("SMTP verify failed:", e?.message || e);
  }
})();

cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    console.log("⏰ Cron tick:", now.toISOString());

    // only reminders we intend to email + are due + not deleted + not sent
    const dueReminders = await Reminder.find({
      deleted: false,
      sendEmail: true,
      sent: false,
      scheduledTime: { $lte: now },
    }).sort({ scheduledTime: 1 });

    console.log(`🔎 Found ${dueReminders.length} due reminder(s)`);

    for (const r of dueReminders) {
      try {
        if (!r.targetEmail) {
          await Reminder.updateOne(
            { _id: r._id },
            {
              $set: { emailStatus: "failed", lastError: "Missing targetEmail" },
            }
          );
          console.warn("⚠️ Skipping; missing targetEmail", r._id.toString());
          continue;
        }

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: r.targetEmail,
          subject: r.emailSubject || `Reminder: ${r.title}`,
          text: r.emailBody || r.message || "",
        });

        await Reminder.updateOne(
          { _id: r._id },
          {
            $set: {
              sent: true,
              sentAt: new Date(),
              emailStatus: "sent",
            },
            $unset: { lastError: "" },
          }
        );

        console.log("✅ Sent", r._id.toString(), "→", r.targetEmail);
      } catch (emailErr) {
        console.error(
          "❌ Send failed",
          r._id.toString(),
          emailErr?.message || emailErr
        );
        // keep sent=false so it retries next tick
        await Reminder.updateOne(
          { _id: r._id },
          {
            $set: {
              emailStatus: "failed",
              lastError: emailErr?.message || String(emailErr),
            },
          }
        );
      }
    }
  } catch (err) {
    console.error("💥 Cron job error:", err?.message || err);
  }
});
