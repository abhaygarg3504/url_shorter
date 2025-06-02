import prisma from "../prisma/client.js";

export const getCustomShortUrl = async (slug) => {
  if (!slug) return null;
  return await prisma.shorter.findFirst({
    where: {
      shortUrl: slug,
    },
  });
};

export const saveShortURL = async (shortUrl, longUrl, userId) => {
  const data = {
    fullUrl: longUrl,
    shortUrl: shortUrl,
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
        clicks:{
            increment: 1
        },
    },
  });
};
