import { findUrlFromShortUrl } from "../dao/user_url.js";
import { createShortUrlWithoutUser, createShortURLWithUser } from "../services/short_url_services.js";

export const createShortURL = async (req, res) => {
  try {
    const { url, slug } = req.body;
    const userId = req.user?._id || null;

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
    res.redirect(url.fullUrl);
  } catch (error) {
    console.log(`error in redirect url is `, error);
    res.status(404).send("URL not found");
  }
};
