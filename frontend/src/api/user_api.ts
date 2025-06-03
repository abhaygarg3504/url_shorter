import axiosInstance from "../utils/AxiosInstance";

export const loginUser = async (email: string, password: string) => {
  const { data } = await axiosInstance.post("/api/auth/login_user", { email, password });
  return data;
};

export const registerUser = async (name: string, email: string, password: string) => {
  const { data } = await axiosInstance.post("/api/auth/register_user", { name, email, password });
  return data;
};

export const getCurrentUser = async () => {
  const { data } = await axiosInstance.get("/api/auth/me", {
    withCredentials: true, 
  });
  return data;
};


export const logoutUser = async () => {
  const { data } = await axiosInstance.post("/api/auth/logout_user");
  return data;
};
