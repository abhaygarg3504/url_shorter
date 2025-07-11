// src/api/analytics_api.ts
import axiosInstance from "../utils/AxiosInstance";

export interface ClickAnalytics {
  id: string;
  shortUrl: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  country?: string;
  region?: string;
  city?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  referrer?: string;
  referrerType?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
}

export interface UserAnalytics {
  totalClicks: number;
  totalUrls: number;
  topUrls: Array<{
    shortUrl: string;
    fullUrl: string;
    clicks: number;
  }>;
  clicksByDay: Array<{
    date: string;
    clicks: number;
  }>;
  recentClicks: ClickAnalytics[];
}

export interface UrlAnalytics {
  shortUrl: string;
  fullUrl: string;
  totalClicks: number;
  clicksByDay: Array<{
    date: string;
    clicks: number;
  }>;
  clicks: ClickAnalytics[];
}

export interface GeographicData {
  country: string;
  clicks: number;
  coordinates?: [number, number];
}

export interface DeviceData {
  deviceType: string;
  browser: string;
  os: string;
  clicks: number;
}

export interface ReferrerData {
  referrerType: string;
  referrer: string;
  clicks: number;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

// API Functions
export const getUserAnalyticsData = async (): Promise<UserAnalytics> => {
  try {
    const response = await axiosInstance.get("/analytics/user");
    return response.data;
  } catch (error) {
    console.error("Error fetching user analytics:", error);
    throw error;
  }
};

export const getUrlAnalyticsData = async (shortUrl: string): Promise<UrlAnalytics> => {
  try {
    const response = await axiosInstance.get(`/analytics/url/${shortUrl}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching URL analytics:", error);
    throw error;
  }
};

export const getGeographicHeatmap = async (): Promise<GeographicData[]> => {
  try {
    const response = await axiosInstance.get("/analytics/geographic");
    return response.data;
  } catch (error) {
    console.error("Error fetching geographic data:", error);
    throw error;
  }
};

export const getDeviceAnalyticsData = async (): Promise<DeviceData[]> => {
  try {
    const response = await axiosInstance.get("/analytics/devices");
    return response.data;
  } catch (error) {
    console.error("Error fetching device analytics:", error);
    throw error;
  }
};

export const getReferrerAnalyticsData = async (): Promise<ReferrerData[]> => {
  try {
    const response = await axiosInstance.get("/analytics/referrers");
    return response.data;
  } catch (error) {
    console.error("Error fetching referrer analytics:", error);
    throw error;
  }
};