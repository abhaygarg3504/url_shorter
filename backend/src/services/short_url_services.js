import { getCustomShortUrl, saveShortURL } from "../dao/user_url.js";
import { generateId } from "../utils/helper.js";

export const createShortUrlWithoutUser = async (url, slug = null) => {
  const shorturl = slug || await generateId(7);

  if (slug) {
    const exists = await getCustomShortUrl(slug);
    if (exists) throw new Error("This custom URL already exists");
  }

  await saveShortURL(shorturl, url, null); 
  return shorturl;
};

export const createShortURLWithUser = async (url, userId, slug = null) => {
  const shorturl = slug || await generateId(7);

  if (slug) {
    const exists = await getCustomShortUrl(slug);
    if (exists) throw new Error("This custom URL already exists");
  }

  await saveShortURL(shorturl, url, userId);
  return shorturl;
};