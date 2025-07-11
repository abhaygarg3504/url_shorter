import geoip from 'geoip-lite';
import { UAParser } from 'ua-parser-js';
import { createClickAnalytics } from '../dao/analytics_dao.js';

// Parse referrer type
const parseReferrerType = (referrer) => {
  if (!referrer) return 'direct';
  
  const url = referrer.toLowerCase();
  
  // Social media patterns
  const socialPatterns = [
    'facebook', 'twitter', 'instagram', 'linkedin', 'youtube',
    'tiktok', 'snapchat', 'pinterest', 'reddit', 'discord'
  ];
  
  // Email patterns
  const emailPatterns = ['gmail', 'outlook', 'yahoo', 'mail'];
  
  // Ads patterns
  const adPatterns = ['google', 'bing', 'ads', 'adwords', 'doubleclick'];
  
  // Search patterns
  const searchPatterns = ['google', 'bing', 'yahoo', 'duckduckgo', 'baidu'];
  
  for (const pattern of socialPatterns) {
    if (url.includes(pattern)) return 'social';
  }
  
  for (const pattern of emailPatterns) {
    if (url.includes(pattern)) return 'email';
  }
  
  for (const pattern of adPatterns) {
    if (url.includes(pattern)) return 'ads';
  }
  
  for (const pattern of searchPatterns) {
    if (url.includes(pattern)) return 'search';
  }
  
  return 'referral';
};

// Parse UTM parameters from referrer
const parseUTMParameters = (referrer) => {
  if (!referrer) return {};
  
  try {
    const url = new URL(referrer);
    return {
      utmSource: url.searchParams.get('utm_source'),
      utmMedium: url.searchParams.get('utm_medium'),
      utmCampaign: url.searchParams.get('utm_campaign'),
      utmTerm: url.searchParams.get('utm_term'),
      utmContent: url.searchParams.get('utm_content'),
    };
  } catch (error) {
    return {};
  }
};

// Get real IP address from request
const getRealIpAddress = (req) => {
  // Check for forwarded IP addresses first
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // Get the first IP in the chain
    const ip = forwarded.split(',')[0].trim();
    if (ip !== '::1' && ip !== '127.0.0.1') {
      return ip;
    }
  }
  
  // Check other headers
  const realIp = req.headers['x-real-ip'];
  if (realIp && realIp !== '::1' && realIp !== '127.0.0.1') {
    return realIp;
  }
  
  // For development, use an Indian IP for testing (this is a public IP from India)
  const originalIp = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  
  // If it's localhost, use a sample Indian IP for testing geographic data
  if (originalIp === '::1' || originalIp === '127.0.0.1' || originalIp === '::ffff:127.0.0.1') {
    // Use a sample Indian IP for testing (this is from Mumbai, India)
    return '103.21.244.0';
  }
  
  return originalIp;
};

// Main analytics tracking function
export const trackClick = async (shortUrl, req) => {
  try {
    const ipAddress = getRealIpAddress(req);
    const userAgent = req.get('User-Agent') || '';
    const referrer = req.get('Referer') || req.get('Referrer') || '';
    
    console.log('Tracking click for IP:', ipAddress); // Debug log
    
    // Parse geographic data
    const geoData = geoip.lookup(ipAddress) || {};
    console.log('Geographic data:', geoData); // Debug log
    
    // Parse device data
    const parser = new UAParser(userAgent);
    const deviceData = parser.getResult();
    
    // Determine device type
    let deviceType = 'desktop';
    if (deviceData.device.type) {
      deviceType = deviceData.device.type;
    } else if (deviceData.os.name && 
               (deviceData.os.name.includes('Android') || 
                deviceData.os.name.includes('iOS'))) {
      deviceType = 'mobile';
    }
    
    // Parse referrer data
    const referrerType = parseReferrerType(referrer);
    const utmParams = parseUTMParameters(referrer);
    
    // Create analytics record
    const analyticsData = {
      shortUrl,
      ipAddress,
      userAgent,
      
      // Geographic data - use default values if not available
      country: geoData.country || 'Unknown',
      region: geoData.region || 'Unknown',
      city: geoData.city || 'Unknown',
      
      // Device data
      deviceType,
      browser: deviceData.browser.name || 'Unknown',
      os: deviceData.os.name || 'Unknown',
      
      // Referrer data
      referrer: referrer || null,
      referrerType,
      ...utmParams,
    };
    
    console.log('Analytics data to save:', analyticsData); // Debug log
    
    await createClickAnalytics(analyticsData);
    
    return { success: true };
  } catch (error) {
    console.error('Error tracking click:', error);
    return { success: false, error: error.message };
  }
};

// Process analytics data for frontend
export const processAnalyticsData = (rawData) => {
  // Group by time (hourly for last 24h, daily for longer periods)
  const timeData = rawData.reduce((acc, item) => {
    const date = new Date(item.timestamp);
    const key = date.toISOString().split('T')[0]; // Daily grouping
    
    if (!acc[key]) {
      acc[key] = 0;
    }
    acc[key]++;
    
    return acc;
  }, {});
  
  // Convert to array format for charts
  const timeSeriesData = Object.entries(timeData).map(([date, count]) => ({
    date,
    clicks: count,
  }));
  
  return timeSeriesData;
};

// Generate analytics summary
export const generateAnalyticsSummary = (analytics) => {
  const totalClicks = analytics.length;
  const uniqueIPs = new Set(analytics.map(a => a.ipAddress)).size;
  const topCountries = analytics.reduce((acc, item) => {
    if (item.country) {
      acc[item.country] = (acc[item.country] || 0) + 1;
    }
    return acc;
  }, {});
  
  const topDevices = analytics.reduce((acc, item) => {
    if (item.deviceType) {
      acc[item.deviceType] = (acc[item.deviceType] || 0) + 1;
    }
    return acc;
  }, {});
  
  const topReferrers = analytics.reduce((acc, item) => {
    if (item.referrerType) {
      acc[item.referrerType] = (acc[item.referrerType] || 0) + 1;
    }
    return acc;
  }, {});
  
  return {
    totalClicks,
    uniqueVisitors: uniqueIPs,
    topCountries: Object.entries(topCountries)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5),
    topDevices: Object.entries(topDevices)
      .sort(([,a], [,b]) => b - a),
    topReferrers: Object.entries(topReferrers)
      .sort(([,a], [,b]) => b - a),
  };
};
