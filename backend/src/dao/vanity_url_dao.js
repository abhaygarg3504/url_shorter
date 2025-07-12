// src/dao/vanity_url_dao.js
import prisma from "../prisma/client.js";

export const createVanityUrl = async (data) => {
  return await prisma.shorter.create({ data });
};

export const findVanityUrlBySlug = async (slug, customDomainId = null) => {
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
};

export const findVanityUrlById = async (id) => {
  return await prisma.shorter.findUnique({
    where: { id },
    include: {
      customDomain: true
    }
  });
};

export const updateVanityUrl = async (id, data) => {
  return await prisma.shorter.update({
    where: { id },
    data
  });
};

export const deleteVanityUrl = async (id) => {
  return await prisma.shorter.delete({
    where: { id }
  });
};

export const getUserVanityUrls = async (userId) => {
  return await prisma.shorter.findMany({
    where: { userId, isVanity: true },
    include: {
      customDomain: true
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const checkVanityUrlAvailability = async (slug, customDomainId = null) => {
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
};