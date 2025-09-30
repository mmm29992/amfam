const cron = require("node-cron");
const createTransporter = require("../utils/emailTransporter");
const Reminder = require("../models/Reminder");
require("dotenv").config();

// Use our env-driven transporter (Brevo/API or SMTP under the hood)
const transporter = createTransporter();

// Optional: prove mailer is ready (no-op for API driver)
(async () => {
  try {
    await transporter.verify?.(); // safe-optional
    console.log("📮 Mailer ready");
  } catch (e) {
    console.error("Mailer verify failed:", e?.message || e);
  }
})();

cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    console.log("⏰ Cron tick:", now.toISOString());

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
          from: {
            email: process.env.EMAIL_FROM_ADDRESS,
            name: process.env.EMAIL_FROM_NAME || "American Family Insurance",
          },
          to: r.targetEmail,
          subject: r.emailSubject || `Reminder: ${r.title}`,
          text: r.emailBody || r.message || "",
          // html: r.emailHtml || undefined,
        });

        await Reminder.updateOne(
          { _id: r._id },
          {
            $set: { sent: true, sentAt: new Date(), emailStatus: "sent" },
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
