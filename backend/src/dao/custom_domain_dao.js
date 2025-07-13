
// src/dao/custom_domain_dao.js
import prisma from "../prisma/client.js";

export const createCustomDomain = async (data) => {
  return await prisma.customDomain.create({ data });
};

export const findCustomDomainByDomain = async (domain) => {
  return await prisma.customDomain.findUnique({
    where: { domain }
  });
};

export const findCustomDomainById = async (id) => {
  return await prisma.customDomain.findUnique({
    where: { id }
  });
};

export const updateCustomDomain = async (id, data) => {
  return await prisma.customDomain.update({
    where: { id },
    data
  });
};

export const deleteCustomDomain = async (id) => {
  return await prisma.customDomain.delete({
    where: { id }
  });
};

export const getUserCustomDomains = async (userId) => {
  return await prisma.customDomain.findMany({
    where: { userId },
    include: {
      _count: {
        select: { shorterUrls: true }  
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};