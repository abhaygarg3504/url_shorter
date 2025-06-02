import bcrypt from "bcryptjs";
import { createUser, findUserByEmail } from "../dao/user_dao.js";
import { signToken } from "../utils/helper.js";

export const registerUser = async (name, email, password, avatar) => {
  const user = await findUserByEmail(email);
  if (user) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10); 
  const newUser = await createUser(name, email, hashedPassword, avatar);

  const token = signToken({ id: newUser.id }); 
  return token;
};
export const loginUser = async (email, password) => {
  const user = await findUserByEmail(email);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password); 

  if (!isMatch) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const token = signToken({ id: user.id });
  return token;
};