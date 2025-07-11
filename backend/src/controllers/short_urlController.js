import { getAllUrls } from "../dao/user_dao.js";
import { findUrlFromShortUrl } from "../dao/user_url.js";
import { trackClick } from "../services/analytics_services.js";
import { createShortUrlWithoutUser, createShortURLWithUser } from "../services/short_url_services.js";

export const createShortURL = async (req, res) => {
  try {
  // console.log("User info:", req.user); // Debug

    const { url, slug } = req.body;
    const userId = req.user?._id || req.user?.id || null;

    const shortUrl = await (userId
      ? createShortURLWithUser(url, userId, slug)
      : createShortUrlWithoutUser(url, slug));

    res.status(200).json({
      shortUrl: process.env.APP_URL + shortUrl,
    });
  } catch (error) {
    console.log(`error in create custom url is`, error);
    res.status(401).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const redirectURL = async (req, res) => {
  try {
    const { id } = req.params;
    const url = await findUrlFromShortUrl(id);
      trackClick(id, req).catch(error => {
      console.error('Error tracking click:', error);
    });
    res.redirect(url.fullUrl);
  } catch (error) {
    console.log(`error in redirect url is `, error);
    res.status(404).send("URL not found");
  }
};

export const getAllUserUrls = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || null;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User not authenticated" });
    }

    const urls = await getAllUrls(userId);
    return res.status(200).json({
      success: true,
      urls,
    });
  } catch (error) {
    console.log("Error in getAllUserUrls:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

