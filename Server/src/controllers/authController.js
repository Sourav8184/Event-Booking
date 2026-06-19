import User from "../models/userModel.js";
import otpModel from "../models/otpModel.js";
import generateOTP from "../utils/generateOTP.js";
import generateToken from "../utils/generateToken.js";
import emailService from "../utils/email.js";
import bcrypt from "bcryptjs";

// =========================
// REGISTER
// =========================
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: "user",
      isVerified: false,
    });

    // generate OTP
    const otp = generateOTP();

    const newOTP = new otpModel({
      email,
      otp,
      action: "account_verification",
    });

    // save both
    await Promise.all([newUser.save(), newOTP.save()]);

    // send email
    await emailService.sendOTPEmail(email, otp, "account_verification");

    return res.status(201).json({
      message: "OTP sent to your email",
      email,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error during registration",
    });
  }
};

// =========================
// LOGIN
// =========================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // if not verified → send OTP again
    if (!user.isVerified) {
      const otp = generateOTP();

      await otpModel.deleteMany({
        email: user.email,
        action: "account_verification",
      });

      await otpModel.create({
        email: user.email,
        otp,
        action: "account_verification",
      });

      await emailService.sendOTPEmail(user.email, otp, "account_verification");

      return res.status(403).json({
        message: "Account not verified. OTP sent again.",
        needsVerification: true,
      });
    }

    // login success
    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error during login",
    });
  }
};

// =========================
// VERIFY OTP
// =========================
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // check OTP + expiry
    const validOTP = await otpModel.findOne({
      email,
      otp,
      action: "account_verification",
    });

    if (!validOTP) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    // verify user
    const user = await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: "after" }
    );

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    // delete OTP after use
    await otpModel.deleteOne({ _id: validOTP._id });

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({
      message: "Server error while verifying OTP",
    });
  }
};
