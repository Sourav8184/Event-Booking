import express from "express";
const router = express.Router();
import {
  bookEvent,
  confirmBooking,
  getMyBookings,
  cancelBooking,
  sendBookingOTP,
} from "../controllers/bookingController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

router.post("/send-otp", protect, sendBookingOTP);
router.post("/", protect, bookEvent);
router.put("/:id/confirm", protect, admin, confirmBooking);
router.get("/my", protect, getMyBookings);
router.delete("/:id", protect, cancelBooking);

export default router;
