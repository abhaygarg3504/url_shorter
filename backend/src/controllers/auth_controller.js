import { loginUser, registerUser } from "../services/auth_services.js";
import { cookieOption } from "../config/config.js";
import {
  findUserByEmail,
  updateUserPassword,
  deleteOtpByEmail,
  createOtp,
  findValidOtp,
} from "../dao/user_dao.js";
import { sendEmail } from "../utils/sendEmails.js";
import bcrypt from "bcryptjs";
export const register_user = async (req, res) => {
  try {
    const { name, email, password, avatar } = req.body;

    const token = await registerUser(name, email, password, avatar);

    res
  .cookie("token", token, cookieOption)
  .status(200)
  .json({
    success: true,
    message: "User registered successfully",
  });

  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

export const login_user = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await loginUser(email, password);

    res.cookie("accessToken", token, cookieOption);

    res.status(200).json({
      success: true,
      message: "Login Successfully",
      token,
      user, 
    });
  } catch (error) {
    res.status(error.statusCode || 401).json({
      success: false,
      message: error.message || "Login failed",
    });
  }
};


export const setUpOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await deleteOtpByEmail(email); // remove previous OTPs
    await createOtp(email, otp); // store new OTP

    await sendEmail(email, "Password Reset OTP", `<strong>Your OTP: ${otp}</strong>`);

    res.status(200).json({ message: "OTP sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const validOtp = await findValidOtp(email, otp);

    if (!validOtp) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashedPassword = await bcrypt.hash(password, 10);

    await updateUserPassword(email, hashedPassword);
    await deleteOtpByEmail(email); // clean up OTP

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout_user = async(req,res)=>{
  try {
     res.clearCookie("accessToken", cookieOption); 
    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
    
  } catch (error) {
    return res.status(404).json({success: false, message: error})
    console.log(`error in logout user is`, error)
  }
}
