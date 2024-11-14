import nodeMailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const sendEmail = async (email, link, name) => {
  const transport = nodeMailer.createTransport({
    host: "live.smtp.mailtrap.io",
    port: 587,
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS,
    },
  });

  const sender = {
    address: "hello@demomailtrap.com",
    name: "AuthKit - Verification",
  };
  const recipients = email;

  transport
    .sendMail({
      from: sender,
      to: recipients,
      subject: "Email Verification - AuthKit",
      html: `<h1>Hello, ${name}!</h1><p>Thank you for choosing AuthKit as your authentication system, down below is your email verification link!</p>${link}`,
      category: "Email Verification",
    })
    .then(console.log, console.error);
};

export default sendEmail;
