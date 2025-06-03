import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";

export const generateId = (length) => {
  return nanoid(length);
};

// export const signToken = (payload) => {
//   return jwt.sign({ id: payload }, process.env.JWT_SECRET, {
//     expiresIn: "7d" 
//   });
// };
// Accepts any payload (e.g., { id, name, email }) and signs it directly
export const signToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
};


export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
