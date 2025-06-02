import axiosInstance from "../utils/AxiosInstance";

export const createShortUrl = async (url: string) => {
  const { data } = await axiosInstance.post("/api/createUrl", { url });
  return data; 
};


