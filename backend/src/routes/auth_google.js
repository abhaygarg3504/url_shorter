import express from "express";
import passport from "passport";
import "../services/passport_google.js";
import { signToken } from "../utils/helper.js";

const router = express.Router();

const cookieOption = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "Lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Step 1: Redirect to Google
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Step 2: Google redirects back
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async (req, res) => {
    const user = req.user;
    const token = signToken({ id: user.id, name: user.name, email: user.email });

    // Pass token and user info as query params to frontend
    const redirectUrl = `${process.env.FRONTEND_URL}/oauth-success?token=${token}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}`;

    res
      .cookie("accessToken", token, cookieOption)
      .redirect(redirectUrl);
  }
);

export default router;