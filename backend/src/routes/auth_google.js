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
    const token = signToken({ id: user.id });

    res
      .cookie("accessToken", token, cookieOption)
      .redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }
);

export default router;
