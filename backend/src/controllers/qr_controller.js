// src/controllers/qr_controller.js
import { generateQRCode, saveQRCode, getQRCode, updateQRCode, trackQRScan } from '../services/qr_services.js';
import { getCustomShortUrl } from '../dao/user_url.js';
import prisma from '../prisma/client.js';

export const createQRCode = async (req, res) => {
  try {
    const { shortUrl, customization = {} } = req.body;
    
    // Validate if short URL exists
    const urlData = await getCustomShortUrl(shortUrl);
    if (!urlData) {
      return res.status(404).json({
        success: false,
        message: 'Short URL not found'
      });
    }

    // Check if user owns this URL (if authenticated)
    const userId = req.user?.id || req.user?._id;
    if (userId && urlData.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to create QR code for this URL'
      });
    }

    // Generate QR code
    const qrCodeData = await generateQRCode(urlData.fullUrl, customization);
    
    // Save QR code to database
    const savedQR = await saveQRCode(shortUrl, qrCodeData, customization);
    
    res.status(201).json({
      success: true,
      message: 'QR code created successfully',
      qrCode: {
        id: savedQR.id,
        shortUrl: savedQR.shortUrl,
        qrData: savedQR.qrData,
        customization: {
          foregroundColor: savedQR.foregroundColor,
          backgroundColor: savedQR.backgroundColor,
          hasLogo: savedQR.hasLogo,
          logoUrl: savedQR.logoUrl,
          logoSize: savedQR.logoSize,
          dotStyle: savedQR.dotStyle,
          cornerStyle: savedQR.cornerStyle,
          hasGradient: savedQR.hasGradient,
          gradientType: savedQR.gradientType,
          gradientDirection: savedQR.gradientDirection,
          gradientStartColor: savedQR.gradientStartColor,
          gradientEndColor: savedQR.gradientEndColor,
          pattern: savedQR.pattern,
          hasBorder: savedQR.hasBorder,
          borderColor: savedQR.borderColor,
          borderWidth: savedQR.borderWidth,
          size: savedQR.size,
          quality: savedQR.quality
        }
      }
    });
  } catch (error) {
    console.error('Error creating QR code:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create QR code'
    });
  }
};

export const getQRCodeData = async (req, res) => {
  try {
    const { shortUrl } = req.params;
    
    const qrCode = await getQRCode(shortUrl);
    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: 'QR code not found'
      });
    }

    // Check if user owns this URL (if authenticated)
    const userId = req.user?.id || req.user?._id;
    if (userId && qrCode.shorter.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this QR code'
      });
    }

    res.status(200).json({
      success: true,
      qrCode: {
        id: qrCode.id,
        shortUrl: qrCode.shortUrl,
        qrData: qrCode.qrData,
        scans: qrCode.scans,
        isDynamic: qrCode.isDynamic,
        customization: {
          foregroundColor: qrCode.foregroundColor,
          backgroundColor: qrCode.backgroundColor,
          hasLogo: qrCode.hasLogo,
          logoUrl: qrCode.logoUrl,
          logoSize: qrCode.logoSize,
          dotStyle: qrCode.dotStyle,
          cornerStyle: qrCode.cornerStyle,
          hasGradient: qrCode.hasGradient,
          gradientType: qrCode.gradientType,
          gradientDirection: qrCode.gradientDirection,
          gradientStartColor: qrCode.gradientStartColor,
          gradientEndColor: qrCode.gradientEndColor,
          pattern: qrCode.pattern,
          hasBorder: qrCode.hasBorder,
          borderColor: qrCode.borderColor,
          borderWidth: qrCode.borderWidth,
          size: qrCode.size,
          quality: qrCode.quality
        },
        createdAt: qrCode.createdAt,
        updatedAt: qrCode.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch QR code'
    });
  }
};

export const updateQRCodeCustomization = async (req, res) => {
  try {
    const { shortUrl } = req.params;
    const { customization } = req.body;
    
    // Check if QR code exists
    const existingQR = await getQRCode(shortUrl);
    if (!existingQR) {
      return res.status(404).json({
        success: false,
        message: 'QR code not found'
      });
    }

    // Check if user owns this URL (if authenticated)
    const userId = req.user?.id || req.user?._id;
    if (userId && existingQR.shorter.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this QR code'
      });
    }

    // Update QR code
    const updatedQR = await updateQRCode(shortUrl, customization);
    
    res.status(200).json({
      success: true,
      message: 'QR code updated successfully',
      qrCode: {
        id: updatedQR.id,
        shortUrl: updatedQR.shortUrl,
        qrData: updatedQR.qrData,
        scans: updatedQR.scans,
        customization: {
          foregroundColor: updatedQR.foregroundColor,
          backgroundColor: updatedQR.backgroundColor,
          hasLogo: updatedQR.hasLogo,
          logoUrl: updatedQR.logoUrl,
          logoSize: updatedQR.logoSize,
          dotStyle: updatedQR.dotStyle,
          cornerStyle: updatedQR.cornerStyle,
          hasGradient: updatedQR.hasGradient,
          gradientType: updatedQR.gradientType,
          gradientDirection: updatedQR.gradientDirection,
          gradientStartColor: updatedQR.gradientStartColor,
          gradientEndColor: updatedQR.gradientEndColor,
          pattern: updatedQR.pattern,
          hasBorder: updatedQR.hasBorder,
          borderColor: updatedQR.borderColor,
          borderWidth: updatedQR.borderWidth,
          size: updatedQR.size,
          quality: updatedQR.quality
        },
        updatedAt: updatedQR.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating QR code:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update QR code'
    });
  }
};

export const downloadQRCode = async (req, res) => {
  try {
    const { shortUrl } = req.params;
    const { format = 'png' } = req.query;
    
    const qrCode = await getQRCode(shortUrl);
    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: 'QR code not found'
      });
    }

    // Extract base64 data
    const base64Data = qrCode.qrData.replace(/^data:image\/[a-z]+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Set appropriate headers for download
    res.setHeader('Content-Type', `image/${format}`);
    res.setHeader('Content-Disposition', `attachment; filename="qr-code-${shortUrl}.${format}"`);
    res.setHeader('Content-Length', imageBuffer.length);
    
    res.send(imageBuffer);
  } catch (error) {
    console.error('Error downloading QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download QR code'
    });
  }
};

export const getQRCodeAnalytics = async (req, res) => {
  try {
    const { shortUrl } = req.params;
    
    const qrCode = await getQRCode(shortUrl);
    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: 'QR code not found'
      });
    }

    // Check if user owns this URL (if authenticated)
    const userId = req.user?.id || req.user?._id;
    if (userId && qrCode.shorter.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view analytics for this QR code'
      });
    }

    // Get detailed scan analytics
    const scanAnalytics = await prisma.qRScan.findMany({
      where: { qrCodeId: qrCode.id },
      orderBy: { timestamp: 'desc' },
      take: 100 // Limit to last 100 scans
    });

    // Aggregate analytics data
    const analytics = {
      totalScans: qrCode.scans,
      recentScans: scanAnalytics.length,
      deviceTypes: {},
      browsers: {},
      operatingSystems: {},
      countries: {},
      scanTimeline: []
    };

    // Process scan data
    scanAnalytics.forEach(scan => {
      // Device types
      if (scan.deviceType) {
        analytics.deviceTypes[scan.deviceType] = (analytics.deviceTypes[scan.deviceType] || 0) + 1;
      }
      
      // Browsers
      if (scan.browser) {
        analytics.browsers[scan.browser] = (analytics.browsers[scan.browser] || 0) + 1;
      }
      
      // Operating Systems
      if (scan.os) {
        analytics.operatingSystems[scan.os] = (analytics.operatingSystems[scan.os] || 0) + 1;
      }
      
      // Countries
      if (scan.country) {
        analytics.countries[scan.country] = (analytics.countries[scan.country] || 0) + 1;
      }
      
      // Timeline data (group by day)
      const scanDate = new Date(scan.timestamp).toDateString();
      const timelineEntry = analytics.scanTimeline.find(entry => entry.date === scanDate);
      if (timelineEntry) {
        timelineEntry.count += 1;
      } else {
        analytics.scanTimeline.push({ date: scanDate, count: 1 });
      }
    });

    // Sort timeline by date
    analytics.scanTimeline.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.status(200).json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Error fetching QR code analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch QR code analytics'
    });
  }
};

export const redirectQRCode = async (req, res) => {
  try {
    const { shortUrl } = req.params;
    
    const qrCode = await getQRCode(shortUrl);
    if (!qrCode) {
      return res.status(404).send('QR code not found');
    }

    // Track QR scan
    await trackQRScan(qrCode.id, req);
    
    // Redirect to the original URL
    res.redirect(qrCode.shorter.fullUrl);
  } catch (error) {
    console.error('Error redirecting QR code:', error);
    res.status(404).send('QR code not found');
  }
};

export const getAllQRCodes = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const qrCodes = await prisma.qRCode.findMany({
      where: {
        shorter: {
          userId: userId
        }
      },
      include: {
        shorter: {
          select: {
            fullUrl: true,
            clicks: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      qrCodes: qrCodes.map(qr => ({
        id: qr.id,
        shortUrl: qr.shortUrl,
        qrData: qr.qrData,
        scans: qr.scans,
        isDynamic: qr.isDynamic,
        fullUrl: qr.shorter.fullUrl,
        clicks: qr.shorter.clicks,
        createdAt: qr.createdAt,
        updatedAt: qr.updatedAt,
        customization: {
          foregroundColor: qr.foregroundColor,
          backgroundColor: qr.backgroundColor,
          hasLogo: qr.hasLogo,
          logoUrl: qr.logoUrl,
          logoSize: qr.logoSize,
          dotStyle: qr.dotStyle,
          cornerStyle: qr.cornerStyle,
          hasGradient: qr.hasGradient,
          gradientType: qr.gradientType,
          gradientDirection: qr.gradientDirection,
          gradientStartColor: qr.gradientStartColor,
          gradientEndColor: qr.gradientEndColor,
          pattern: qr.pattern,
          hasBorder: qr.hasBorder,
          borderColor: qr.borderColor,
          borderWidth: qr.borderWidth,
          size: qr.size,
          quality: qr.quality
        }
      }))
    });
  } catch (error) {
    console.error('Error fetching QR codes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch QR codes'
    });
  }
};

export const deleteQRCode = async (req, res) => {
  try {
    const { shortUrl } = req.params;
    
    const qrCode = await getQRCode(shortUrl);
    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: 'QR code not found'
      });
    }

    // Check if user owns this URL (if authenticated)
    const userId = req.user?.id || req.user?._id;
    if (userId && qrCode.shorter.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this QR code'
      });
    }

    // Delete QR code and all associated scans
    await prisma.qRScan.deleteMany({
      where: { qrCodeId: qrCode.id }
    });

    await prisma.qRCode.delete({
      where: { shortUrl }
    });

    // Update the shorter record to mark QR code as disabled
    await prisma.shorter.update({
      where: { shortUrl },
      data: { qrCodeEnabled: false }
    });

    res.status(200).json({
      success: true,
      message: 'QR code deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete QR code'
    });
  }
};