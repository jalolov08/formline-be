import jwt from "jsonwebtoken";
import { jwtSecret } from "../config";
import { UserType } from "../types/user.type";
export function generateToken(user: UserType) {
  return jwt.sign(
    {
      _id: user._id,
    },
    jwtSecret,
    { algorithm: "HS256", expiresIn: "100h" }
  );
}
