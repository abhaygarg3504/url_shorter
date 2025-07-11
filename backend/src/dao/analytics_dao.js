import prisma from "../prisma/client.js";

// Create analytics record
export const createClickAnalytics = async (analyticsData) => {
  return await prisma.clickAnalytics.create({
    data: analyticsData,
  });
};

// Get analytics for a specific short URL
export const getUrlAnalytics = async (shortUrl) => {
  return await prisma.clickAnalytics.findMany({
    where: { shortUrl },
    orderBy: { timestamp: 'desc' },
  });
};

// Get analytics for all URLs of a user
export const getUserAnalytics = async (userId) => {
  return await prisma.clickAnalytics.findMany({
    where: {
      shorter: {
        userId: userId,
      },
    },
    include: {
      shorter: {
        select: {
          shortUrl: true,
          fullUrl: true,
          clicks: true,
        },
      },
    },
    orderBy: { timestamp: 'desc' },
  });
};

// Get geographic analytics
export const getGeographicAnalytics = async (userId) => {
  return await prisma.clickAnalytics.groupBy({
    by: ['country', 'region'],
    where: {
      shorter: {
        userId: userId,
      },
    },
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
  });
};

// Get device analytics
export const getDeviceAnalytics = async (userId) => {
  return await prisma.clickAnalytics.groupBy({
    by: ['deviceType', 'browser', 'os'],
    where: {
      shorter: {
        userId: userId,
      },
    },
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
  });
};

// Get referrer analytics
export const getReferrerAnalytics = async (userId) => {
  return await prisma.clickAnalytics.groupBy({
    by: ['referrerType'],
    where: {
      shorter: {
        userId: userId,
      },
    },
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
  });
};

// Get time-based analytics
export const getTimeBasedAnalytics = async (userId, timeRange = '7d') => {
  const now = new Date();
  let startDate;
  
  switch (timeRange) {
    case '24h':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  return await prisma.clickAnalytics.findMany({
    where: {
      shorter: {
        userId: userId,
      },
      timestamp: {
        gte: startDate,
      },
    },
    select: {
      timestamp: true,
      shortUrl: true,
    },
    orderBy: { timestamp: 'asc' },
  });
};

// Get top performing URLs
export const getTopUrls = async (userId, limit = 10) => {
  return await prisma.shorter.findMany({
    where: {
      userId: userId,
    },
    orderBy: {
      clicks: 'desc',
    },
    take: limit,
    select: {
      id: true,
      shortUrl: true,
      fullUrl: true,
      clicks: true,
      createdAt: true,
    },
  });
};

// Get UTM analytics - Fixed query
export const getUTMAnalytics = async (userId) => {
  return await prisma.clickAnalytics.groupBy({
    by: ['utmSource', 'utmMedium', 'utmCampaign'],
    where: {
      shorter: {
        userId: userId,
      },
      // Using AND with individual conditions instead of OR
      AND: [
        {
          utmSource: { not: null },
        },
        {
          utmMedium: { not: null },
        },
        {
          utmCampaign: { not: null },
        },
      ],
    },
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
  });
};
