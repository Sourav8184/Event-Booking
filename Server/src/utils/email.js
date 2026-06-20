import nodemailer from "nodemailer"; // Import nodemailer
import dotenv from "dotenv"; // Import dotenv

dotenv.config(); // Load .env variables

// Create Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Gmail address
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
});

// Send booking confirmation email
const sendBookingEmail = async (userEmail, userName, eventTitle) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender email
      to: userEmail, // Receiver email
      subject: `Booking Confirmed: ${eventTitle}`, // Email subject

      // Email body
      html: `
        <h2>Hi ${userName}!</h2>
        <p>Your booking for the event <strong>${eventTitle}</strong> is successfully confirmed.</p>
        <p>Thank you for choosing Event Booking.</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    console.log("Email sent successfully to", userEmail);
  } catch (error) {
    // Handle errors
    console.error("Error sending email:", error);
  }
};

// Send OTP email
const sendOTPEmail = async (userEmail, otp, type) => {
  try {
    // Set email title based on type
    const title =
      type === "account_verification"
        ? "Verify your Event Booking Account"
        : "Event Booking Verification";

    // Set message based on type
    const msg =
      type === "account_verification"
        ? "Please use the following OTP to verify your new Event Booking account."
        : "Please use the following OTP to verify and confirm your event booking.";

    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender email
      to: userEmail, // Receiver email
      subject: title, // Email subject

      // HTML email template
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
          <h2 style="color: #111;">${title}</h2>

          <p style="color: #555; font-size: 16px;">
            ${msg}
          </p>

          <div style="
              margin: 20px auto;
              padding: 15px;
              font-size: 24px;
              font-weight: bold;
              background: #f4f4f4;
              width: max-content;
              letter-spacing: 5px;">
            ${otp}
          </div>

          <p style="color: #999; font-size: 12px;">
            This code expires in 5 minutes.
            If you didn't request this, please ignore this email.
          </p>
        </div>
      `,
    };
    const ans = mailOptions;
    // Send OTP email
    await transporter.sendMail(mailOptions);

    console.log(`OTP sent to ${userEmail} for ${type}`);
  } catch (error) {
    // Handle errors
    console.error("Error sending OTP email:", error);
  }
};

export const sendBookingCancellationEmail = async (email, name, eventTitle) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Booking Cancelled",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Booking Cancelled</h2>

          <p>Hello <strong>${name}</strong>,</p>

          <p>
            Your booking for the event
            <strong>${eventTitle}</strong>
            has been cancelled successfully.
          </p>

          <p>
            If this cancellation was not intended, you may book the event again
            if seats are available.
          </p>

          <br />

          <p>Thank you,</p>
          <p><strong>Event Booking Team</strong></p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Cancellation Email Error:", error);
    throw error;
  }
};

export default {
  sendBookingEmail,
  sendOTPEmail,
  sendBookingCancellationEmail,
};
