
// src/controllers/vanity_url_controller.js
import { VanityUrlService } from '../services/vanity_url_services.js';
import { CustomDomainService } from '../services/custom_domain_services.js';

export const generateVanitySuggestions = async (req, res) => {
  try {
    const { url, title } = req.body;

    if (!url) {
      return res.status(400).json({ success: false, message: 'URL is required' });
    }

    const suggestions = VanityUrlService.generateVanitySuggestions(url, title);
    
    res.status(200).json({
      success: true,
      suggestions
    });
  } catch (error) {
    console.error('Error generating vanity suggestions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

export const createVanityUrl = async (req, res) => {
  try {
    const { url, vanitySlug, customDomainId, title, description } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    if (!url || !vanitySlug) {
      return res.status(400).json({ success: false, message: 'URL and vanity slug are required' });
    }

    // If customDomainId is provided, verify user owns the domain
    if (customDomainId) {
      const domain = await CustomDomainService.getDomainById(customDomainId);
      if (!domain || domain.userId !== userId || !domain.isVerified) {
        return res.status(400).json({ success: false, message: 'Invalid or unverified custom domain' });
      }
    }

    const result = await VanityUrlService.createVanityUrl({
      fullUrl: url,
      vanitySlug,
      userId,
      customDomainId,
      title,
      description
    });
    
    // Build complete URL for response
    const domain = customDomainId ? await CustomDomainService.getDomainById(customDomainId) : null;
    const completeUrl = VanityUrlService.buildVanityUrl(vanitySlug, domain);
    
    res.status(201).json({
      success: true,
      data: {
        ...result,
        completeUrl
      }
    });
  } catch (error) {
    console.error('Error creating vanity URL:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

export const checkVanityAvailability = async (req, res) => {
  try {
    const { slug, customDomainId } = req.query;

    if (!slug) {
      return res.status(400).json({ success: false, message: 'Slug is required' });
    }

    // Validate slug format
    if (!VanityUrlService.isValidSlug(slug)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid slug format. Use only lowercase letters, numbers, and hyphens.'
      });
    }

    const isAvailable = await VanityUrlService.isVanityUrlAvailable(slug, customDomainId);
    
    res.status(200).json({
      success: true,
      available: isAvailable
    });
  } catch (error) {
    console.error('Error checking vanity availability:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

export const getUserVanityUrls = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const vanityUrls = await VanityUrlService.getUserVanityUrls(userId);
    
    // Add complete URLs
    const enrichedUrls = vanityUrls.map(url => ({
      ...url,
      completeUrl: VanityUrlService.buildVanityUrl(url.vanitySlug, url.customDomain)
    }));
    
    res.status(200).json({
      success: true,
      data: enrichedUrls
    });
  } catch (error) {
    console.error('Error getting user vanity URLs:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

export const updateVanityUrl = async (req, res) => {
  try {
    const { id } = req.params;
    const { vanitySlug, title, description } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const result = await VanityUrlService.updateVanityUrl(id, {
      vanitySlug,
      title,
      description
    }, userId);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error updating vanity URL:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

export const deleteVanityUrl = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const result = await VanityUrlService.deleteVanityUrl(id, userId);
    
    res.status(200).json({
      success: result.success,
      message: result.message
    });
  } catch (error) {
    console.error('Error deleting vanity URL:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

