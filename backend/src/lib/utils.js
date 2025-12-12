import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true, // prevent XSS attacks --- cannot be accessed by JS on client side
    sameSite: "none", // CSRF protection --- if frontend and backend are on same domain then use 'strict'
    secure: process.env.NODE_ENV !== "development", // set to true in production (HTTPS), false in development (HTTP)
  });

  return token;
};
