// src/api/user_api.ts (Updated with fixed endpoints)
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

export const getAllShortUrls = async () => {
  const { data } = await axiosInstance.post("/api/createUrl/urls", {}, {
    withCredentials: true,
  });
  return data;
};

export const logoutUser = async () => {
  const { data } = await axiosInstance.post("/api/auth/logout_user");
  return data;
};

// Custom Domain Functions
export const addCustomDomain = async (domain: string) => {
  const { data } = await axiosInstance.post("/api/custom-domains/add", { domain }, {
    withCredentials: true,
  });
  return data;
};

export const verifyCustomDomain = async (domainId: string) => {
  const { data } = await axiosInstance.post(`/api/custom-domains/verify/${domainId}`, {}, {
    withCredentials: true,
  });
  return data;
};

export const getUserCustomDomains = async () => {
  const { data } = await axiosInstance.get("/api/custom-domains", {
    withCredentials: true,
  });
  return data;
};

export const deleteCustomDomain = async (domainId: string) => {
  const { data } = await axiosInstance.delete(`/api/custom-domains/${domainId}`, {
    withCredentials: true,
  });
  return data;
};

export const checkDomainAvailability = async (domain: string) => {
  const { data } = await axiosInstance.get(`/api/custom-domains/check-availability?domain=${domain}`, {
    withCredentials: true,
  });
  return data;
};

// Vanity URL Functions (Fixed endpoint from 'vanit-urls' to 'vanity-urls')
export const generateVanitySuggestions = async (url: string, title?: string) => {
  const { data } = await axiosInstance.post("/api/vanity-urls/suggestions", { url, title }, {
    withCredentials: true,
  });
  return data;
};

export const createVanityUrl = async (options: {
  url: string;
  vanitySlug: string;
  customDomainId?: string;
  title?: string;
  description?: string;
}) => {
  const { data } = await axiosInstance.post("/api/vanity-urls/create", options, {
    withCredentials: true,
  });
  return data;
};

export const checkVanityAvailability = async (slug: string, customDomainId?: string) => {
  const params = new URLSearchParams({ slug });
  if (customDomainId) params.append('customDomainId', customDomainId);
  
  const { data } = await axiosInstance.get(`/api/vanity-urls/check-availability?${params}`, {
    withCredentials: true,
  });
  return data;
};

export const getUserVanityUrls = async () => {
  const { data } = await axiosInstance.get("/api/vanity-urls", {
    withCredentials: true,
  });
  return data;
};

export const updateVanityUrl = async (id: string, updates: {
  vanitySlug?: string;
  title?: string;
  description?: string;
}) => {
  const { data } = await axiosInstance.put(`/api/vanity-urls/${id}`, updates, {
    withCredentials: true,
  });
  return data;
};

// Delete vanity URL function (you might need this)
export const deleteVanityUrl = async (id: string) => {
  const { data } = await axiosInstance.delete(`/api/vanity-urls/${id}`, {
    withCredentials: true,
  });
  return data;
};
