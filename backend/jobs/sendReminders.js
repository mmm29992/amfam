const cron = require("node-cron");
const transporter = require("../utils/emailTransporter"); // use the shared transporter
const Reminder = require("../models/Reminder");
require("dotenv").config();

// Runs every minute
cron.schedule("* * * * *", async () => {
  try {
    console.log("⏰ Running reminder cron job...");

    const now = new Date();

    const dueReminders = await Reminder.find({
      scheduledTime: { $lte: now },
      sent: false,
    });

    for (const reminder of dueReminders) {
      if (reminder.sendEmail && reminder.targetEmail) {
        try {
          await transporter.sendMail({
            from: `"Reminder Bot" <${process.env.EMAIL_USER}>`,
            to: reminder.targetEmail,
            subject: reminder.emailSubject || "Reminder Notification",
            text: reminder.emailBody || reminder.message,
          });
          console.log(`📧 Sent email to ${reminder.targetEmail}`);
        } catch (emailErr) {
          console.error(`❌ Failed to send email: ${emailErr.message}`);
        }
      }

      reminder.sent = true;
      reminder.sentAt = now;
      reminder.emailStatus = "sent";
      await reminder.save();
    }
  } catch (err) {
    console.error("💥 Cron job error:", err);
  }
});
