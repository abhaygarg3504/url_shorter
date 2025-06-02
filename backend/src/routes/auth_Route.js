import express from "express"
import { login_user, register_user, setUpOTP,verifyOTP,resetPassword, logout_user } from "../controllers/auth_controller.js"
import { authMiddleWare } from "../middleware/auth.js"
const router=  express.Router()

router.post("/register_user", register_user)
router.post("/login_user", login_user)
router.post("/setUpOtp", setUpOTP);
router.post("/verifyOtp", verifyOTP);
router.post("/resetPassword", resetPassword);
router.post("/logout_user", logout_user)
router.get("/me", authMiddleWare, (req,res)=>{
    res.status(200).json({user: req.user})
})

export default router
