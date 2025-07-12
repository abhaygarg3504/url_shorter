// src/services/vanity_url_service.js
import prisma from '../prisma/client.js';
import { generateId } from '../utils/helper.js';

export class VanityUrlService {
  
  // Generate vanity URL suggestions
  static generateVanitySuggestions(originalUrl, title = '') {
    const suggestions = [];
    
    try {
      const urlObj = new URL(originalUrl);
      const hostname = urlObj.hostname.replace('www.', '');
      const pathname = urlObj.pathname;
      
      // Extract meaningful parts
      const pathParts = pathname.split('/').filter(part => part.length > 0);
      const domainParts = hostname.split('.');
      
      // Generate suggestions
      if (title) {
        const titleSlug = this.createSlug(title);
        suggestions.push(titleSlug);
        suggestions.push(`${titleSlug}-2025`);
      }
      
      // From domain
      if (domainParts.length > 1) {
        suggestions.push(domainParts[0]);
      }
      
      // From path
      if (pathParts.length > 0) {
        suggestions.push(pathParts[0]);
        suggestions.push(pathParts[pathParts.length - 1]);
      }
      
      // Product/business related
      const businessWords = ['offer', 'sale', 'launch', 'promo', 'deal', 'signup'];
      businessWords.forEach(word => {
        if (domainParts[0]) {
          suggestions.push(`${domainParts[0]}-${word}`);
        }
      });
      
      // Seasonal
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      suggestions.push(`launch-${currentYear}`);
      suggestions.push(`q${Math.ceil(currentMonth / 3)}-${currentYear}`);
      
    } catch (error) {
      console.error('Error generating suggestions:', error);
    }
    
    // Remove duplicates and filter valid slugs
    return [...new Set(suggestions)]
      .filter(slug => this.isValidSlug(slug))
      .slice(0, 8);
  }

  // Create slug from text
  static createSlug(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
  }

  // Validate slug
  static isValidSlug(slug) {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 50;
  }

  // Check if vanity URL is available
  static async isVanityUrlAvailable(slug, customDomainId = null) {
    const where = customDomainId 
      ? { vanitySlug: slug, customDomainId }
      : { 
          OR: [
            { shortUrl: slug },
            { vanitySlug: slug }
          ]
        };
    
    const existing = await prisma.shorter.findFirst({ where });
    return !existing;
  }

  // Create vanity URL
  static async createVanityUrl(options) {
    const {
      fullUrl,
      vanitySlug,
      userId,
      customDomainId = null,
      title = null,
      description = null
    } = options;

    // Validate slug
    if (!this.isValidSlug(vanitySlug)) {
      throw new Error('Invalid vanity URL format. Use only lowercase letters, numbers, and hyphens.');
    }

    // Check availability
    const isAvailable = await this.isVanityUrlAvailable(vanitySlug, customDomainId);
    if (!isAvailable) {
      throw new Error('Vanity URL already exists');
    }

    // Generate short URL (for internal use)
    const shortUrl = customDomainId ? await generateId(7) : vanitySlug;

    // Create the URL record
    const data = {
      fullUrl,
      shortUrl,
      vanitySlug,
      isVanity: true,
      title,
      description,
      userId,
      customDomainId,
      clicks: 0
    };

    const shorterUrl = await prisma.shorter.create({ data });
    
    return {
      id: shorterUrl.id,
      shortUrl: shorterUrl.shortUrl,
      vanitySlug: shorterUrl.vanitySlug,
      fullUrl: shorterUrl.fullUrl,
      customDomainId: shorterUrl.customDomainId
    };
  }

  // Get vanity URL by slug
  static async getVanityUrlBySlug(slug, customDomainId = null) {
    const where = customDomainId 
      ? { vanitySlug: slug, customDomainId }
      : { vanitySlug: slug };

    return await prisma.shorter.findFirst({
      where,
      include: {
        customDomain: true,
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  }

  // Update vanity URL
  static async updateVanityUrl(id, updates, userId) {
    const { vanitySlug, title, description } = updates;
    
    // Verify ownership
    const existing = await prisma.shorter.findFirst({
      where: { id, userId }
    });
    
    if (!existing) {
      throw new Error('Vanity URL not found or unauthorized');
    }
    
    // If updating slug, check availability
    if (vanitySlug && vanitySlug !== existing.vanitySlug) {
      if (!this.isValidSlug(vanitySlug)) {
        throw new Error('Invalid vanity URL format');
      }
      
      const isAvailable = await this.isVanityUrlAvailable(vanitySlug, existing.customDomainId);
      if (!isAvailable) {
        throw new Error('Vanity URL already exists');
      }
    }
    
    return await prisma.shorter.update({
      where: { id },
      data: {
        vanitySlug: vanitySlug || existing.vanitySlug,
        title: title !== undefined ? title : existing.title,
        description: description !== undefined ? description : existing.description
      }
    });
  }

  // Get user's vanity URLs
  static async getUserVanityUrls(userId) {
    return await prisma.shorter.findMany({
      where: { userId, isVanity: true },
      include: {
        customDomain: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Build complete vanity URL
  static buildVanityUrl(vanitySlug, customDomain = null) {
    if (customDomain && customDomain.isVerified) {
      return `https://${customDomain.domain}/${vanitySlug}`;
    }
    return `${process.env.APP_URL}/${vanitySlug}`;
  }

  // Delete vanity URL
  static async deleteVanityUrl(id, userId) {
    const existing = await prisma.shorter.findFirst({
      where: { id, userId }
    });
    
    if (!existing) {
      throw new Error('Vanity URL not found or unauthorized');
    }
    
    await prisma.shorter.delete({
      where: { id }
    });
    
    return { success: true, message: 'Vanity URL deleted successfully' };
  }
}
