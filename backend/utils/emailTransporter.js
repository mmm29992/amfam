const nodemailer = require("nodemailer");

function createTransporter(provider, email, password) {
  let config;

  if (provider === "gmail") {
    config = {
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // true for 465, false for 587
      auth: { user: email, pass: password },
    };
  } else if (provider === "outlook") {
    config = {
      host: "smtp.office365.com",
      port: 587,
      secure: false,
      auth: { user: email, pass: password },
    };
  } else if (provider === "yahoo") {
    config = {
      host: "smtp.mail.yahoo.com",
      port: 465,
      secure: true,
      auth: { user: email, pass: password },
    };
  } else {
    throw new Error("Unsupported email provider: " + provider);
  }

  return nodemailer.createTransport(config);
}

module.exports = createTransporter;
