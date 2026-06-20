import mongoose from "mongoose";
import Booking from "../models/bookingModel.js";
import Event from "../models/eventModel.js";
import otpModel from "../models/otpModel.js";
import emailService from "../utils/email.js";
import generateOTP from "../utils/generateOTP.js";

// =========================
// SEND BOOKING OTP
// =========================
export const sendBookingOTP = async (req, res) => {
  try {
    const otp = generateOTP();

    await otpModel.findOneAndDelete({
      email: req.user.email,
      action: "event_booking",
    });

    await otpModel.create({
      email: req.user.email,
      otp,
      action: "event_booking",
    });

    await emailService.sendOTPEmail(req.user.email, otp, "event_booking");

    res.json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error sending OTP",
      error: error.message,
    });
  }
};

// =========================
// BOOK EVENT
// =========================
export const bookEvent = async (req, res) => {
  try {
    const { eventId, otp } = req.body;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        message: "Invalid Event ID",
      });
    }

    const validOTP = await otpModel.findOne({
      email: req.user.email,
      otp,
      action: "event_booking",
    });

    if (!validOTP) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    const event = await Event.findOne({
      _id: eventId,
    });

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    if (event.availableSeats <= 0) {
      return res.status(400).json({
        message: "No seats available",
      });
    }

    const existingBooking = await Booking.findOne({
      userId: req.user.id,
      eventId,
      status: { $ne: "cancelled" },
    });

    if (existingBooking) {
      return res.status(400).json({
        message: "You already have a booking for this event",
      });
    }

    const booking = await Booking.create({
      userId: req.user.id,
      eventId,
      status: "pending",
      paymentStatus: "not_paid",
      amount: event.ticketPrice,
    });

    await otpModel.deleteOne({
      _id: validOTP._id,
    });

    res.status(201).json({
      message: "Booking request submitted",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// =========================
// CONFIRM BOOKING (ADMIN)
// =========================
export const confirmBooking = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid Booking ID",
      });
    }

    const booking = await Booking.findById(id)
      .populate("userId")
      .populate("eventId");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (booking.status === "confirmed") {
      return res.status(400).json({
        message: "Booking already confirmed",
      });
    } else if (booking.status === "cancelled") {
      return res.status(400).json({
        message: "Cannot confirm a cancelled booking",
      });
    }

    if (!booking.eventId) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    if (paymentStatus !== "paid") {
      return res.status(400).json({
        message: "Payment must be marked as paid",
      });
    }

    const event = await Event.findById(booking.eventId._id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    if (event.availableSeats <= 0) {
      return res.status(400).json({
        message: "No seats available",
      });
    }

    // Reduce seat count
    event.availableSeats -= 1;
    await event.save();

    // Update booking
    booking.status = "confirmed";
    booking.paymentStatus = "paid";

    await booking.save();

    // Send confirmation email
    await emailService.sendBookingEmail(
      booking.userId.email,
      booking.userId.name,
      event.title
    );

    return res.status(200).json({
      message: "Booking confirmed successfully",
      booking,
    });
  } catch (error) {
    console.error("Confirm Booking Error:", error);

    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// =========================
// GET BOOKINGS
// =========================
export const getMyBookings = async (req, res) => {
  try {
    let bookings;

    if (req.user.role === "admin") {
      bookings = await Booking.find()
        .populate("eventId")
        .populate("userId", "name email")
        .sort({ createdAt: -1 });
    } else {
      bookings = await Booking.find({
        userId: req.user.id,
      })
        .populate("eventId")
        .sort({ createdAt: -1 });
    }

    res.json(bookings);
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// =========================
// CANCEL BOOKING
// =========================
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid Booking ID",
      });
    }

    const booking = await Booking.findById(id)
      .populate("userId")
      .populate("eventId");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (
      booking.userId._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        message: "Booking already cancelled",
      });
    }

    const wasConfirmed = booking.status === "confirmed";

    booking.status = "cancelled";

    if (booking.paymentStatus === "paid") {
      booking.paymentStatus = "refunded";
    }

    await booking.save();

    // Restore seat if booking was confirmed
    if (wasConfirmed && booking.eventId) {
      await Event.findByIdAndUpdate(
        booking.eventId._id,
        {
          $inc: {
            availableSeats: 1,
          },
        },
        {
          returnDocument: "after",
        }
      );
    }

    // Send cancellation email
    await emailService.sendBookingCancellationEmail(
      booking.userId.email,
      booking.userId.name,
      booking.eventId.title
    );

    return res.status(200).json({
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    console.error("Cancel Booking Error:", error);

    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};
