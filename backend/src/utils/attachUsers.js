// import { findUserById } from "../dao/user_dao.js";
// import { verifyToken } from "./helper.js";

// export const attachUser = async (req, res, next) => {
//   const token = req.cookies.accessToken;
//   if (!token) return next();

//   try {
//     const decoded = verifyToken(token);
//     // console.log("Decoded JWT:", decoded);

//     const userId = decoded._id || decoded.id.id; 
//     if (!userId) {
//       console.warn("No valid user ID in token.");
//       return next();
//     }

//     const user = await findUserById(userId);
//     if (user) {
//       req.user = { _id: user.id }; 
//     }

//     next();
//   } catch (error) {
//     console.error("Error in attachUser middleware:", error);
//     next();
//   }
// };
import { findUserById } from "../dao/user_dao.js";
import { verifyToken } from "./helper.js";

export const attachUser = async (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return next();

  try {
    const decoded = verifyToken(token);

    // Support multiple token formats
    const userId = decoded._id || decoded.id || (decoded.id && decoded.id.id);
    if (!userId) {
      console.warn("No valid user ID in token.");
      return next();
    }

    const user = await findUserById(userId);
    if (user) {
      req.user = { _id: user.id }; 
    }

    next();
  } catch (error) {
    console.error("Error in attachUser middleware:", error);
    next();
  }
};
