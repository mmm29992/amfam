const cron = require("node-cron");
const nodemailer = require("nodemailer");
const Reminder = require("../models/Reminder");
require("dotenv").config();

// Email setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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
      // Send email
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

      // Mark reminder as sent
      reminder.sent = true;
      reminder.sentAt = now;
      reminder.emailStatus = "sent";
      await reminder.save();
    }
  } catch (err) {
    console.error("💥 Cron job error:", err);
  }
});
