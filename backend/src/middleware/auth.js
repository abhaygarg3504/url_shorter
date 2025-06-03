import { findUserById } from "../dao/user_dao.js";
import { verifyToken } from "../utils/helper.js";

export const authMiddleWare = async (req, res, next) => {
  // Try to get token from Authorization header
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // Fallback to cookie if no header token
  if (!token) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  try {
    const decoded = verifyToken(token);
    const userId = decoded._id || decoded.id?.id || decoded.id;

    const user = await findUserById(userId);
    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
};
