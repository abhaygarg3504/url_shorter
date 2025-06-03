import express from "express";
import { createShortURL, getAllUserUrls } from "../controllers/short_urlController.js";
import { authMiddleWare } from "../middleware/auth.js";

const router = express.Router();

router.post("/", createShortURL);
router.post("/urls", authMiddleWare, getAllUserUrls)
export default router;
