// src/api/qr_api.ts
import axiosInstance from "../utils/AxiosInstance";

export interface QRCustomization {
  size?: number;
  foregroundColor?: string;
  backgroundColor?: string;
  quality?: 'L' | 'M' | 'Q' | 'H';
  dotStyle?: 'square' | 'circle' | 'rounded';
  cornerStyle?: 'square' | 'circle' | 'rounded';
  hasGradient?: boolean;
  gradientStartColor?: string;
  gradientEndColor?: string;
  gradientType?: 'linear' | 'radial';
  gradientDirection?: string;
  pattern?: 'solid' | 'dots' | 'lines';
  hasBorder?: boolean;
  borderColor?: string;
  borderWidth?: number;
  hasLogo?: boolean;
  logoUrl?: string;
  logoSize?: number;
  isDynamic?: boolean;
}

export interface QRCodeData {
  id: string;
  shortUrl: string;
  qrData: string;
  scans: number;
  isDynamic: boolean;
  fullUrl?: string;
  clicks?: number;
  createdAt: string;
  updatedAt: string;
  customization: QRCustomization;
}

export interface QRAnalytics {
  totalScans: number;
  recentScans: number;
  deviceTypes: Record<string, number>;
  browsers: Record<string, number>;
  operatingSystems: Record<string, number>;
  countries: Record<string, number>;
  scanTimeline: Array<{ date: string; count: number }>;
}

export const createQRCode = async (shortUrl: string, customization: QRCustomization = {}) => {
  const { data } = await axiosInstance.post("/api/qr/create", { 
    shortUrl, 
    customization 
  }, {
    withCredentials: true
  });
  return data;
};

export const getQRCode = async (shortUrl: string) => {
  const { data } = await axiosInstance.get(`/api/qr/data/${shortUrl}`, {
    withCredentials: true
  });
  return data;
};

export const updateQRCode = async (shortUrl: string, customization: QRCustomization) => {
  const { data } = await axiosInstance.put(`/api/qr/update/${shortUrl}`, {
    customization
  }, {
    withCredentials: true
  });
  return data;
};

export const downloadQRCode = async (shortUrl: string, format: string = 'png') => {
  const response = await axiosInstance.get(`/api/qr/download/${shortUrl}`, {
    params: { format },
    responseType: 'blob',
    withCredentials: true
  });
  
  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `qr-code-${shortUrl}.${format}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const getQRCodeAnalytics = async (shortUrl: string): Promise<QRAnalytics> => {
  const { data } = await axiosInstance.get(`/api/qr/analytics/${shortUrl}`, {
    withCredentials: true
  });
  return data.analytics;
};

export const getAllQRCodes = async (): Promise<QRCodeData[]> => {
  const { data } = await axiosInstance.get("/api/qr/all", {
    withCredentials: true
  });
  return data.qrCodes;
};

export const deleteQRCode = async (shortUrl: string) => {
  const { data } = await axiosInstance.delete(`/api/qr/delete/${shortUrl}`, {
    withCredentials: true
  });
  return data;
};
