// src/services/custom_domain_service.js
import dns from 'dns';
import crypto from 'crypto';
import { promisify } from 'util';
import prisma from '../prisma/client.js';

const resolveTxt = promisify(dns.resolveTxt);

export class CustomDomainService {
  
  // Generate verification token for domain
  static generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // In CustomDomainService.js, improve the DNS record creation:
static async addCustomDomain(userId, domain) {
  try {
    const cleanDomain = this.cleanDomain(domain);
    
    // Check if domain already exists
    const existingDomain = await prisma.customDomain.findUnique({
      where: { domain: cleanDomain }
    });
    
    if (existingDomain) {
      throw new Error('Domain already exists');
    }
    
    const verificationToken = this.generateVerificationToken();
    const dnsRecord = `urlshortener-verify=${verificationToken}`;
    
    // Create custom domain record
    const customDomain = await prisma.customDomain.create({
      data: {
        domain: cleanDomain,
        userId,
        verificationToken,
        dnsRecord,
        status: 'pending',
        isVerified: false
      }
    });
    
    return {
      domain: customDomain,
      instructions: {
        recordType: 'TXT',
        recordName: '@',
        recordValue: dnsRecord,
        ttl: 300,
        steps: [
          '1. Log in to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)',
          '2. Navigate to DNS Management or DNS Settings',
          '3. Add a new TXT record with these exact details:',
          '   - Record Type: TXT',
          '   - Name/Host: @ (or root domain)',
          `   - Value: ${dnsRecord}`,
          '   - TTL: 300 seconds (or lowest available)',
          '4. Save the DNS record',
          '5. Wait 5-30 minutes for DNS propagation',
          '6. Click "Verify Domain" to check verification status',
          '',
          'Note: Some registrars may require you to enter just the verification token without quotes.'
        ]
      }
    };
  } catch (error) {
    console.error('Error adding custom domain:', error);
    throw error;
  }
}

  // Verify domain ownership
  // In src/services/custom_domain_service.js - verifyDomain method
// Replace the DNS verification section with this:

static async verifyDomain(domainId, userId) {
  try {
    const domain = await prisma.customDomain.findFirst({
      where: { id: domainId, userId }
    });
    
    if (!domain) {
      return { success: false, message: 'Domain not found or unauthorized' };
    }
    
    // Check TXT record with better error handling
    let txtRecords;
    try {
      txtRecords = await resolveTxt(domain.domain);
    } catch (dnsError) {
      console.error('DNS resolution failed:', dnsError);
      await prisma.customDomain.update({
        where: { id: domainId },
        data: {
          status: 'failed',
          lastChecked: new Date()
        }
      });
      return { 
        success: false, 
        message: 'DNS resolution failed. Please ensure the TXT record is added and try again after DNS propagation (5-30 minutes).' 
      };
    }
    
    const flatRecords = txtRecords.flat();
    const expectedRecord = `urlshortener-verify=${domain.verificationToken}`;
    
    console.log('Expected record:', expectedRecord);
    console.log('Found records:', flatRecords);
    
    const isVerified = flatRecords.some(record => {
      const cleanRecord = record.replace(/['"]/g, '').trim();
      return cleanRecord === expectedRecord;
    });
    
    if (isVerified) {
      await prisma.customDomain.update({
        where: { id: domainId },
        data: {
          isVerified: true,
          status: 'verified',
          lastChecked: new Date()
        }
      });
      return { success: true, message: 'Domain verified successfully' };
    } else {
      await prisma.customDomain.update({
        where: { id: domainId },
        data: {
          status: 'failed',
          lastChecked: new Date()
        }
      });
      return { 
        success: false, 
        message: `Domain verification failed. Expected: ${expectedRecord}. Found: ${flatRecords.join(', ')}` 
      };
    }
  } catch (error) {
    console.error('Error verifying domain:', error);
    return { success: false, message: 'Internal server error during verification' };
  }
}

  // Get all domains for a user
  static async getUserDomains(userId) {
  return await prisma.customDomain.findMany({
    where: { userId },
    include: {
      _count: {
        select: { shorterUrls: true }  // ✅ Use the correct field name
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

  // Clean domain input
  static cleanDomain(domain) {
    return domain
      .replace(/^https?:\/\//, '') // Remove protocol
      .replace(/^www\./, '') // Remove www
      .replace(/\/$/, '') // Remove trailing slash
      .toLowerCase()
      .trim();
  }

  // Check if domain is available
  static async isDomainAvailable(domain) {
    const cleanDomain = this.cleanDomain(domain);
    const existing = await prisma.customDomain.findUnique({
      where: { domain: cleanDomain }
    });
    return !existing;
  }

  // Delete custom domain
  static async deleteCustomDomain(domainId, userId) {
    const domain = await prisma.customDomain.findFirst({
      where: { id: domainId, userId }
    });
    
    if (!domain) {
      throw new Error('Domain not found or unauthorized');
    }
    
    // Check if domain has any URLs
    const urlCount = await prisma.shorter.count({
      where: { customDomainId: domainId }
    });
    
    if (urlCount > 0) {
      throw new Error('Cannot delete domain with existing URLs. Please delete all URLs first.');
    }
    
    await prisma.customDomain.delete({
      where: { id: domainId }
    });
    
    return { success: true, message: 'Domain deleted successfully' };
  }

  // Get domain by name
  static async getDomainByName(domainName) {
    const cleanDomain = this.cleanDomain(domainName);
    return await prisma.customDomain.findUnique({
      where: { domain: cleanDomain }
    });
  }

  // Get domain by ID
  static async getDomainById(domainId) {
    return await prisma.customDomain.findUnique({
      where: { id: domainId }
    });
  }

  // Add this method to CustomDomainService:
static async debugDNSRecords(domain) {
  try {
    const txtRecords = await resolveTxt(domain);
    console.log('DNS TXT Records for', domain, ':', txtRecords);
    return txtRecords;
  } catch (error) {
    console.error('DNS Debug Error:', error);
    throw error;
  }
}

// Add this method to CustomDomainService for debugging
static async debugDomainVerification(domainId, userId) {
  const domain = await prisma.customDomain.findFirst({
    where: { id: domainId, userId }
  });
  
  if (!domain) {
    console.log('Domain not found');
    return;
  }
  
  console.log('Domain:', domain.domain);
  console.log('Expected token:', domain.verificationToken);
  console.log('Expected record:', `urlshortener-verify=${domain.verificationToken}`);
  
  try {
    const txtRecords = await resolveTxt(domain.domain);
    console.log('Raw TXT records:', txtRecords);
    console.log('Flat records:', txtRecords.flat());
  } catch (error) {
    console.log('DNS Error:', error.message);
  }
}

}
