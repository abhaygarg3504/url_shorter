import express from "express"
import { login_user, register_user, setUpOTP,verifyOTP,resetPassword } from "../controllers/auth_controller.js"
const router=  express.Router()

router.post("/register_user", register_user)
router.post("/login_user", login_user)
router.post("/setUpOtp", setUpOTP);
router.post("/verifyOtp", verifyOTP);
router.post("/resetPassword", resetPassword);
export default router
