import prisma from "../prisma/client.js";

export const findUserByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: { email }
  });
};
export const findUserById = async (userId) => {
  return await prisma.user.findUnique({
    where: { id: userId }, 
  });
};

export const createUser = async (name, email, password, avatar) => {
  const finalAvatar = avatar?.trim() !== "" ? avatar : undefined; 

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password,
      ...(finalAvatar && { avatar: finalAvatar })
    }
  });

  return newUser;
};

export const getAllUrls = async (userId) => {
  return await prisma.shorter.findMany({
    where: {
      userId: userId,
    },
  });
};



export const updateUserPassword = async (email, hashedPassword) => {
  return await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });
};

export const deleteOtpByEmail = async (email) => {
  return await prisma.token.deleteMany({ where: { email } });
};

export const createOtp = async (email, otp) => {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  return await prisma.token.create({
    data: {
      email,
      otp,
      expiresAt,
    },
  });
};

export const findValidOtp = async (email, otp) => {
  return await prisma.token.findFirst({
    where: {
      email,
      otp,
      expiresAt: {
        gt: new Date(),
      },
    },
  });
};
