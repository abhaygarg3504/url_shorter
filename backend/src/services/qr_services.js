// src/services/qr_service.js
import QRCode from 'qrcode';
import { createCanvas } from 'canvas';
import sharp from 'sharp';
import prisma from '../prisma/client.js';

export const generateQRCode = async (url, customization = {}) => {
  try {
    const {
      size = 200,
      foregroundColor = '#000000',
      backgroundColor = '#ffffff',
      quality = 'M',
      dotStyle = 'square',
      cornerStyle = 'square',
      hasGradient = false,
      gradientStartColor = '#000000',
      gradientEndColor = '#666666',
      gradientType = 'linear',
      gradientDirection = 'to-bottom',
      pattern = 'solid',
      hasBorder = false,
      borderColor = '#000000',
      borderWidth = 1,
      hasLogo = false,
      logoUrl = null,
      logoSize = 20
    } = customization;

    // Generate basic QR code
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Set background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, size, size);

    // Generate QR code data
    const qrOptions = {
      errorCorrectionLevel: quality,
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: foregroundColor,
        light: backgroundColor
      },
      width: size
    };

    // Generate QR code to buffer
    const qrBuffer = await QRCode.toBuffer(url, qrOptions);
    let finalImage = sharp(qrBuffer);

    // Apply gradient if enabled
    if (hasGradient) {
      const gradientSvg = generateGradientSvg(size, gradientStartColor, gradientEndColor, gradientType, gradientDirection);
      const gradientBuffer = Buffer.from(gradientSvg);
      
      finalImage = finalImage.composite([
        { input: gradientBuffer, blend: 'multiply' }
      ]);
    }

    // Apply pattern if specified
    if (pattern !== 'solid') {
      const patternBuffer = await generatePattern(size, pattern, foregroundColor);
      finalImage = finalImage.composite([
        { input: patternBuffer, blend: 'overlay' }
      ]);
    }

    // Add border if enabled
    if (hasBorder) {
      finalImage = finalImage.extend({
        top: borderWidth,
        bottom: borderWidth,
        left: borderWidth,
        right: borderWidth,
        background: borderColor
      });
    }

    // Add logo if enabled and logoUrl is provided
    if (hasLogo && logoUrl) {
      try {
        const logoBuffer = await downloadAndResizeLogo(logoUrl, size, logoSize);
        const logoPosition = {
          left: Math.floor((size - (size * logoSize / 100)) / 2),
          top: Math.floor((size - (size * logoSize / 100)) / 2)
        };
        
        finalImage = finalImage.composite([
          { input: logoBuffer, ...logoPosition }
        ]);
      } catch (logoError) {
        console.error('Error adding logo:', logoError);
        // Continue without logo if there's an error
      }
    }

    // Convert to base64
    const finalBuffer = await finalImage.png().toBuffer();
    const base64 = finalBuffer.toString('base64');
    
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

const generateGradientSvg = (size, startColor, endColor, type, direction) => {
  const gradientId = 'gradient-' + Date.now();
  let gradientDef = '';
  
  if (type === 'linear') {
    const directions = {
      'to-top': { x1: '0%', y1: '100%', x2: '0%', y2: '0%' },
      'to-bottom': { x1: '0%', y1: '0%', x2: '0%', y2: '100%' },
      'to-left': { x1: '100%', y1: '0%', x2: '0%', y2: '0%' },
      'to-right': { x1: '0%', y1: '0%', x2: '100%', y2: '0%' },
      'to-top-right': { x1: '0%', y1: '100%', x2: '100%', y2: '0%' },
      'to-bottom-right': { x1: '0%', y1: '0%', x2: '100%', y2: '100%' },
      'to-bottom-left': { x1: '100%', y1: '0%', x2: '0%', y2: '100%' },
      'to-top-left': { x1: '100%', y1: '100%', x2: '0%', y2: '0%' }
    };
    
    const dir = directions[direction] || directions['to-bottom'];
    gradientDef = `
      <linearGradient id="${gradientId}" x1="${dir.x1}" y1="${dir.y1}" x2="${dir.x2}" y2="${dir.y2}">
        <stop offset="0%" style="stop-color:${startColor};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${endColor};stop-opacity:1" />
      </linearGradient>
    `;
  } else {
    gradientDef = `
      <radialGradient id="${gradientId}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" style="stop-color:${startColor};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${endColor};stop-opacity:1" />
      </radialGradient>
    `;
  }
  
  return `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        ${gradientDef}
      </defs>
      <rect width="100%" height="100%" fill="url(#${gradientId})" />
    </svg>
  `;
};

const generatePattern = async (size, pattern, color) => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  ctx.fillStyle = color;
  
  if (pattern === 'dots') {
    const dotSize = 2;
    const spacing = 8;
    
    for (let x = 0; x < size; x += spacing) {
      for (let y = 0; y < size; y += spacing) {
        ctx.beginPath();
        ctx.arc(x + dotSize/2, y + dotSize/2, dotSize/2, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  } else if (pattern === 'lines') {
    const lineWidth = 1;
    const spacing = 6;
    
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    
    for (let x = 0; x < size; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size);
      ctx.stroke();
    }
  }
  
  return canvas.toBuffer();
};

const downloadAndResizeLogo = async (logoUrl, qrSize, logoSizePercentage) => {
  try {
    const response = await fetch(logoUrl);
    const logoBuffer = await response.buffer();
    
    const logoSize = Math.floor(qrSize * logoSizePercentage / 100);
    
    return await sharp(logoBuffer)
      .resize(logoSize, logoSize, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .png()
      .toBuffer();
  } catch (error) {
    throw new Error('Failed to download or resize logo');
  }
};

export const saveQRCode = async (shortUrl, qrData, customization = {}) => {
  try {
    const qrCodeData = {
      shortUrl,
      qrData,
      isDynamic: customization.isDynamic || false,
      foregroundColor: customization.foregroundColor || '#000000',
      backgroundColor: customization.backgroundColor || '#ffffff',
      hasLogo: customization.hasLogo || false,
      logoUrl: customization.logoUrl || null,
      logoSize: customization.logoSize || 20,
      dotStyle: customization.dotStyle || 'square',
      cornerStyle: customization.cornerStyle || 'square',
      hasGradient: customization.hasGradient || false,
      gradientType: customization.gradientType || 'linear',
      gradientDirection: customization.gradientDirection || 'to-bottom',
      gradientStartColor: customization.gradientStartColor || null,
      gradientEndColor: customization.gradientEndColor || null,
      pattern: customization.pattern || 'solid',
      hasBorder: customization.hasBorder || false,
      borderColor: customization.borderColor || '#000000',
      borderWidth: customization.borderWidth || 1,
      size: customization.size || 200,
      quality: customization.quality || 'M'
    };

    const qrCode = await prisma.qRCode.create({
      data: qrCodeData
    });

    // Update the shorter record to mark QR code as enabled
    await prisma.shorter.update({
      where: { shortUrl },
      data: { qrCodeEnabled: true }
    });

    return qrCode;
  } catch (error) {
    console.error('Error saving QR code:', error);
    throw new Error('Failed to save QR code');
  }
};

export const getQRCode = async (shortUrl) => {
  try {
    return await prisma.qRCode.findUnique({
      where: { shortUrl },
      include: {
        shorter: {
          select: {
            fullUrl: true,
            clicks: true
          }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching QR code:', error);
    throw new Error('Failed to fetch QR code');
  }
};

export const updateQRCode = async (shortUrl, customization) => {
  try {
    const existingQR = await getQRCode(shortUrl);
    if (!existingQR) {
      throw new Error('QR Code not found');
    }

    // Generate new QR code with updated customization
    const newQRData = await generateQRCode(existingQR.shorter.fullUrl, customization);
    
    // Update the QR code record
    return await prisma.qRCode.update({
      where: { shortUrl },
      data: {
        qrData: newQRData,
        foregroundColor: customization.foregroundColor || existingQR.foregroundColor,
        backgroundColor: customization.backgroundColor || existingQR.backgroundColor,
        hasLogo: customization.hasLogo || existingQR.hasLogo,
        logoUrl: customization.logoUrl || existingQR.logoUrl,
        logoSize: customization.logoSize || existingQR.logoSize,
        dotStyle: customization.dotStyle || existingQR.dotStyle,
        cornerStyle: customization.cornerStyle || existingQR.cornerStyle,
        hasGradient: customization.hasGradient || existingQR.hasGradient,
        gradientType: customization.gradientType || existingQR.gradientType,
        gradientDirection: customization.gradientDirection || existingQR.gradientDirection,
        gradientStartColor: customization.gradientStartColor || existingQR.gradientStartColor,
        gradientEndColor: customization.gradientEndColor || existingQR.gradientEndColor,
        pattern: customization.pattern || existingQR.pattern,
        hasBorder: customization.hasBorder || existingQR.hasBorder,
        borderColor: customization.borderColor || existingQR.borderColor,
        borderWidth: customization.borderWidth || existingQR.borderWidth,
        size: customization.size || existingQR.size,
        quality: customization.quality || existingQR.quality,
        updatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error updating QR code:', error);
    throw new Error('Failed to update QR code');
  }
};

export const trackQRScan = async (qrCodeId, req) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    
    // Parse user agent for device info (you can use a library like ua-parser-js)
    const deviceInfo = parseUserAgent(userAgent);
    
    await prisma.qRScan.create({
      data: {
        qrCodeId,
        ipAddress,
        userAgent,
        deviceType: deviceInfo.deviceType,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        referrer: req.get('Referer') || null
      }
    });

    // Increment scan count
    await prisma.qRCode.update({
      where: { id: qrCodeId },
      data: {
        scans: {
          increment: 1
        }
      }
    });
  } catch (error) {
    console.error('Error tracking QR scan:', error);
    // Don't throw error to avoid breaking the main flow
  }
};

const parseUserAgent = (userAgent) => {
  // Basic user agent parsing - you can use ua-parser-js for more detailed parsing
  const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
  const isTablet = /iPad|Tablet/.test(userAgent);
  
  let deviceType = 'desktop';
  if (isTablet) deviceType = 'tablet';
  else if (isMobile) deviceType = 'mobile';
  
  let browser = 'unknown';
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';
  
  let os = 'unknown';
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS')) os = 'iOS';
  
  return { deviceType, browser, os };
};