import {
  getUserAnalytics,
  getGeographicAnalytics,
  getDeviceAnalytics,
  getReferrerAnalytics,
  getTimeBasedAnalytics,
  getTopUrls,
  getUTMAnalytics,
} from '../dao/analytics_dao.js';
import { generateAnalyticsSummary, processAnalyticsData } from '../services/analytics_services.js'

// Get comprehensive analytics for a user
export const getUserAnalyticsData = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const { timeRange = '7d' } = req.query;

    // Get all analytics data
    const [
      allAnalytics,
      geographicData,
      deviceData,
      referrerData,
      timeBasedData,
      topUrls,
      utmData
    ] = await Promise.all([
      getUserAnalytics(userId),
      getGeographicAnalytics(userId),
      getDeviceAnalytics(userId),
      getReferrerAnalytics(userId),
      getTimeBasedAnalytics(userId, timeRange),
      getTopUrls(userId, 10),
      getUTMAnalytics(userId),
    ]);

    // Process data for frontend
    const summary = generateAnalyticsSummary(allAnalytics);
    const timeSeriesData = processAnalyticsData(timeBasedData);

    res.status(200).json({
      success: true,
      data: {
        summary,
        timeSeriesData,
        geographicData,
        deviceData,
        referrerData,
        topUrls,
        utmData,
        totalAnalytics: allAnalytics.length,
      },
    });
  } catch (error) {
    console.error('Error getting user analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get analytics for a specific URL
export const getUrlAnalyticsData = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { shortUrl } = req.params;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    // Verify the URL belongs to the user
    const userAnalytics = await getUserAnalytics(userId);
    const urlAnalytics = userAnalytics.filter(a => a.shortUrl === shortUrl);

    if (urlAnalytics.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'URL not found or does not belong to user',
      });
    }

    const summary = generateAnalyticsSummary(urlAnalytics);
    const timeSeriesData = processAnalyticsData(urlAnalytics);

    res.status(200).json({
      success: true,
      data: {
        shortUrl,
        summary,
        timeSeriesData,
        recentClicks: urlAnalytics.slice(0, 50), // Latest 50 clicks
      },
    });
  } catch (error) {
    console.error('Error getting URL analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get geographic heatmap data
export const getGeographicHeatmap = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const geographicData = await getGeographicAnalytics(userId);
    console.log('Raw geographic data:', geographicData); // Debug log
    
    // Transform data for heatmap and filter out null values
    const heatmapData = geographicData
      .filter(item => item.country && item.country !== 'Unknown')
      .map(item => ({
        country: item.country,
        region: item.region,
        clicks: item._count.id,
      }));

    // If no valid geographic data, return sample data for development
    if (heatmapData.length === 0) {
      const sampleData = geographicData.map(item => ({
        country: item.country || 'Unknown',
        region: item.region || 'Unknown', 
        clicks: item._count.id,
      }));
      
      return res.status(200).json({
        success: true,
        data: sampleData,
        message: 'Geographic data may be limited due to local development environment'
      });
    }

    res.status(200).json({
      success: true,
      data: heatmapData,
    });
  } catch (error) {
    console.error('Error getting geographic heatmap:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get device analytics
export const getDeviceAnalyticsData = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const deviceData = await getDeviceAnalytics(userId);
    
    // Group by device type
    const deviceTypeData = deviceData.reduce((acc, item) => {
      const key = item.deviceType || 'unknown';
      if (!acc[key]) {
        acc[key] = 0;
      }
      acc[key] += item._count.id;
      return acc;
    }, {});

    // Group by browser
    const browserData = deviceData.reduce((acc, item) => {
      const key = item.browser || 'unknown';
      if (!acc[key]) {
        acc[key] = 0;
      }
      acc[key] += item._count.id;
      return acc;
    }, {});

    // Group by OS
    const osData = deviceData.reduce((acc, item) => {
      const key = item.os || 'unknown';
      if (!acc[key]) {
        acc[key] = 0;
      }
      acc[key] += item._count.id;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        deviceTypes: Object.entries(deviceTypeData).map(([type, count]) => ({
          type,
          count,
        })),
        browsers: Object.entries(browserData).map(([browser, count]) => ({
          browser,
          count,
        })),
        operatingSystems: Object.entries(osData).map(([os, count]) => ({
          os,
          count,
        })),
      },
    });
  } catch (error) {
    console.error('Error getting device analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get referrer analytics
export const getReferrerAnalyticsData = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const [referrerData, utmData] = await Promise.all([
      getReferrerAnalytics(userId),
      getUTMAnalytics(userId),
    ]);

    console.log('Raw referrer data:', referrerData); // Debug log
    console.log('Raw UTM data:', utmData); // Debug log

    // Transform referrer data
    const referrerTypes = referrerData.map(item => ({
      type: item.referrerType || 'direct',
      count: item._count.id,
    }));

    // Transform UTM data - filter out entries where all UTM fields are null
    const utmCampaigns = utmData
      .filter(item => item.utmSource || item.utmMedium || item.utmCampaign)
      .map(item => ({
        source: item.utmSource || 'N/A',
        medium: item.utmMedium || 'N/A',
        campaign: item.utmCampaign || 'N/A',
        count: item._count.id,
      }));

    // If no UTM data, you can add sample data for testing
    if (utmCampaigns.length === 0) {
      // Add a note that no UTM campaigns were found
      return res.status(200).json({
        success: true,
        data: {
          referrerTypes,
          utmCampaigns: [],
          message: 'No UTM campaigns found. UTM parameters are tracked when users click links with utm_source, utm_medium, or utm_campaign parameters.'
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        referrerTypes,
        utmCampaigns,
      },
    });
  } catch (error) {
    console.error('Error getting referrer analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};