import express from "express";
import { authMiddleWare } from "../middleware/auth.js";
import {
  getUserAnalyticsData,
  getUrlAnalyticsData,
  getGeographicHeatmap,
  getDeviceAnalyticsData,
  getReferrerAnalyticsData,
} from "../controllers/analytics_controller.js";

const router = express.Router();

// Get comprehensive analytics for user
router.get("/user", authMiddleWare, getUserAnalyticsData);

// Get analytics for specific URL
router.get("/url/:shortUrl", authMiddleWare, getUrlAnalyticsData);

// Get geographic heatmap data
router.get("/geographic", authMiddleWare, getGeographicHeatmap);

// Get device analytics
router.get("/devices", authMiddleWare, getDeviceAnalyticsData);

// Get referrer analytics
router.get("/referrers", authMiddleWare, getReferrerAnalyticsData);

export default router;