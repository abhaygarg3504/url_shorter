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

  // Add custom domain for user
  static async addCustomDomain(userId, domain) {
    try {
      // Clean domain (remove protocol, www, etc.)
      const cleanDomain = this.cleanDomain(domain);
      
      // Check if domain already exists
      const existingDomain = await prisma.customDomain.findUnique({
        where: { domain: cleanDomain }
      });
      
      if (existingDomain) {
        throw new Error('Domain already exists');
      }
      
      // Generate verification token
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
            '1. Log in to your domain registrar (GoDaddy, Namecheap, etc.)',
            '2. Go to DNS Management or DNS Settings',
            '3. Add a new TXT record with the following details:',
            `   - Name/Host: @ (or leave blank)`,
            `   - Value/Content: ${dnsRecord}`,
            `   - TTL: 300 (or automatic)`,
            '4. Save the record and wait for propagation (5-30 minutes)',
            '5. Click "Verify Domain" button below'
          ]
        }
      };
    } catch (error) {
      console.error('Error adding custom domain:', error);
      throw error;
    }
  }

  // Verify domain ownership
  static async verifyDomain(domainId, userId) {
    try {
      const domain = await prisma.customDomain.findFirst({
        where: { id: domainId, userId }
      });
      
      if (!domain) {
        throw new Error('Domain not found or unauthorized');
      }
      
      // Check TXT record
      const txtRecords = await resolveTxt(domain.domain);
      const flatRecords = txtRecords.flat();
      
      const isVerified = flatRecords.some(record => 
        record.includes(`urlshortener-verify=${domain.verificationToken}`)
      );
      
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
        return { success: false, message: 'Domain verification failed' };
      }
    } catch (error) {
      console.error('Error verifying domain:', error);
      await prisma.customDomain.update({
        where: { id: domainId },
        data: {
          status: 'failed',
          lastChecked: new Date()
        }
      });
      throw error;
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
}