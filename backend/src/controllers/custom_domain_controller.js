
// src/controllers/custom_domain_controller.js
import { CustomDomainService } from '../services/custom_domain_services.js';

export const addCustomDomain = async (req, res) => {
  try {
    const { domain } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    if (!domain) {
      return res.status(400).json({ success: false, message: 'Domain is required' });
    }

    // Check if domain is available
    const isAvailable = await CustomDomainService.isDomainAvailable(domain);
    if (!isAvailable) {
      return res.status(400).json({ success: false, message: 'Domain already exists' });
    }

    const result = await CustomDomainService.addCustomDomain(userId, domain);
    
    res.status(201).json({
      success: true,
      message: 'Custom domain added successfully',
      data: result
    });
  } catch (error) {
    console.error('Error adding custom domain:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

export const verifyDomain = async (req, res) => {
  try {
    const { domainId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const result = await CustomDomainService.verifyDomain(domainId, userId);
    
    res.status(200).json({
      success: result.success,
      message: result.message
    });
  } catch (error) {
    console.error('Error verifying domain:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

export const getUserDomains = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const domains = await CustomDomainService.getUserDomains(userId);
    
    res.status(200).json({
      success: true,
      data: domains
    });
  } catch (error) {
    console.error('Error getting user domains:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

export const deleteCustomDomain = async (req, res) => {
  try {
    const { domainId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const result = await CustomDomainService.deleteCustomDomain(domainId, userId);
    
    res.status(200).json({
      success: result.success,
      message: result.message
    });
  } catch (error) {
    console.error('Error deleting custom domain:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

export const checkDomainAvailability = async (req, res) => {
  try {
    const { domain } = req.query;

    if (!domain) {
      return res.status(400).json({ success: false, message: 'Domain is required' });
    }

    const isAvailable = await CustomDomainService.isDomainAvailable(domain);
    
    res.status(200).json({
      success: true,
      available: isAvailable
    });
  } catch (error) {
    console.error('Error checking domain availability:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};