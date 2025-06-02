import express from "express";
import { createShortURL } from "../controllers/short_urlController.js";

const router = express.Router();

router.post("/", createShortURL);

export default router;
