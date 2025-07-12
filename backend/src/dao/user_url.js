import prisma from "../prisma/client.js";

export const getCustomShortUrl = async (slug) => {
  if (!slug) return null;
  return await prisma.shorter.findFirst({
    where: {
      OR: [
        { shortUrl: slug },
        { vanitySlug: slug }
      ]
    },
  });
};

export const saveShortURL = async (shortUrl, longUrl, userId) => {
  const data = {
    fullUrl: longUrl,
    shortUrl: shortUrl,
    clicks: 0,
    isVanity: false
  };

  if (userId) {
    data.userId = userId;
  }

  await prisma.shorter.create({ data });
};

export const findUrlFromShortUrl = async (shortUrl) => {
  return await prisma.shorter.update({
    where: { shortUrl },
    data: {
      clicks: {
        increment: 1
      },
    },
  });
};

// Find URL by vanity slug
export const findUrlByVanitySlug = async (vanitySlug, customDomainId = null) => {
  const where = customDomainId 
    ? { vanitySlug, customDomainId }
    : { vanitySlug };

  return await prisma.shorter.findFirst({
    where,
    include: {
      customDomain: true
    }
  });
};

// Update URL clicks
export const updateUrlClicks = async (id) => {
  return await prisma.shorter.update({
    where: { id },
    data: {
      clicks: {
        increment: 1
      },
    },
  });
};
