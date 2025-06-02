import axiosInstance from "../utils/AxiosInstance";

export const setUpOtp = async (email: string) => {
  const { data } = await axiosInstance.post("/api/auth/setUpOtp", { email });
  return data;
};

export const verifyOtp = async (email: string, otp: string) => {
  const { data } = await axiosInstance.post("/api/auth/verifyOtp", { email, otp });
  return data;
};

export const resetPassword = async (email: string, password: string) => {
  const { data } = await axiosInstance.post("/api/auth/resetPassword", { email, password });
  return data;
};
