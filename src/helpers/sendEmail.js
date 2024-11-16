// Import required modules
import nodeMailer from "nodemailer";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

/**
 * Creates a transporter for sending emails using NodeMailer.
 *
 * @returns {object} - The transporter object for sending emails.
 */
const createTransporter = () => {
  return nodeMailer.createTransport({
    host: "live.smtp.mailtrap.io",
    port: 587,
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS,
    },
  });
};

/**
 * Sends an email using the provided parameters.
 *
 * @param {string} to - The recipient's email address.
 * @param {string} subject - The subject of the email.
 * @param {string} html - The HTML content of the email.
 */
const sendEmail = async (to, subject, html) => {
  const transporter = createTransporter();

  const sender = {
    address: "hello@demomailtrap.com",
    name: "AuthKit",
  };

  try {
    const info = await transporter.sendMail({
      from: sender,
      to,
      subject,
      html,
    });
    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

/**
 * Sends a verification email to the user.
 *
 * @param {string} email - The recipient's email address.
 * @param {string} link - The verification link.
 * @param {string} name - The name of the recipient.
 */
export const verificationEmail = async (email, link, name) => {
  const subject = "Email Verification - Authify";
  const html = `<h1>Hello, ${name}!</h1>
                <p>Thank you for choosing Authify as your authentication system. Below is your email verification link:</p>
                <p><a href="${link}">${link}</a></p>`;
  await sendEmail(email, subject, html);
};

/**
 * Sends a password reset email to the user.
 *
 * @param {string} email - The recipient's email address.
 * @param {string} link - The password reset link.
 */
export const passwordResetEmail = async (email, link) => {
  const subject = "Password Reset - Authify";
  const html = `<h1>Hello!</h1>
                <p>Thank you for choosing Authify as your authentication system. Below is your password reset link:</p>
                <p><a href="${link}">${link}</a></p>`;
  await sendEmail(email, subject, html);
};
