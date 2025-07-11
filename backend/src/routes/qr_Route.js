// src/routes/qr_routes.js
import express from "express";
import { 
  createQRCode, 
  getQRCodeData, 
  updateQRCodeCustomization, 
  downloadQRCode, 
  getQRCodeAnalytics,
  redirectQRCode,
  getAllQRCodes,
  deleteQRCode
} from "../controllers/qr_controller.js";
import { authMiddleWare } from "../middleware/auth.js";

const router = express.Router();

// Public routes (no authentication required)
router.get("/redirect/:shortUrl", redirectQRCode);
router.get("/download/:shortUrl", downloadQRCode);

// Protected routes (authentication required)
router.post("/create", authMiddleWare, createQRCode);
router.get("/data/:shortUrl", authMiddleWare, getQRCodeData);
router.put("/update/:shortUrl", authMiddleWare, updateQRCodeCustomization);
router.get("/analytics/:shortUrl", authMiddleWare, getQRCodeAnalytics);
router.get("/all", authMiddleWare, getAllQRCodes);
router.delete("/delete/:shortUrl", authMiddleWare, deleteQRCode);

export default router;