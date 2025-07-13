// src/middleware/domain_middleware.js
import { CustomDomainService } from '../services/custom_domain_services.js';
import { VanityUrlService } from '../services/vanity_url_services.js';
import { trackClick } from '../services/analytics_services.js';

export const domainMiddleware = async (req, res, next) => {
  try {
     let host = req.get('host');
    
    // Remove port if present
    if (host && host.includes(':')) {
      host = host.split(':')[0];
    }
    
    const baseDomain = process.env.BASE_DOMAIN || 'localhost';
    
    // Clean base domain of port as well
    const cleanBaseDomain = baseDomain.includes(':') ? baseDomain.split(':')[0] : baseDomain;
    
    // If it's the base domain, continue normal processing
    if (host === cleanBaseDomain || host === 'localhost') {
      return next();
    }
    
    // Check if it's a custom domain
    const customDomain = await CustomDomainService.getDomainByName(host);
    
    if (customDomain && customDomain.isVerified) {
      // Store custom domain info in request
      req.customDomain = customDomain;
      
      // Extract path for vanity URL lookup
      const path = req.path.substring(1); // Remove leading slash
      
      if (path) {
        // Look for vanity URL with this custom domain
        const vanityUrl = await VanityUrlService.getVanityUrlBySlug(path, customDomain.id);
        
        if (vanityUrl) {
          // Track the click
          trackClick(vanityUrl.shortUrl, req).catch(error => {
            console.error('Error tracking click:', error);
          });
          
          // Redirect to the actual URL
          return res.redirect(vanityUrl.fullUrl);
        }
      }
    }
    
    // If no custom domain or vanity URL found, continue to next middleware
    next();
  } catch (error) {
    console.error('Error in domain middleware:', error);
    next();
  }
};

// Middleware to validate custom domain requests
export const validateCustomDomain = async (req, res, next) => {
  try {
    const { domain } = req.body;
    
    if (!domain) {
      return res.status(400).json({ success: false, message: 'Domain is required' });
    }
    
    const cleanDomain = CustomDomainService.cleanDomain(domain);
   const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
    
    if (!domainRegex.test(cleanDomain)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid domain format. Please enter a valid domain like example.com' 
      });
    }

    if (cleanDomain.length > 253) {
      return res.status(400).json({ 
        success: false, 
        message: 'Domain name too long' 
      });
    }
    
    // Check for reserved domains
    const reservedDomains = ['localhost', 'example.com', 'test.com', process.env.BASE_DOMAIN];
    if (reservedDomains.includes(cleanDomain)) {
      return res.status(400).json({ 
        success: false, 
        message: 'This domain is reserved' 
      });
    }
    
    req.cleanDomain = cleanDomain;
    next();
  } catch (error) {
    console.error('Error validating domain:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};