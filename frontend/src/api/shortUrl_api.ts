// src/api/shortUrl_api.ts
import axiosInstance from "../utils/AxiosInstance";

export const createShortUrl = async (url: string, slug?: string) => {
  const { data } = await axiosInstance.post("/api/createUrl", { url, slug });
  return data.shortUrl; // return just the URL string
};


