//This file creates and checks login tokens.
import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error("Please add JWT_SECRET to .env.local");
}

export function createToken(userId) {
  return jwt.sign({ userId }, secret, {  //.sign() => creates token
    expiresIn: "7d",
  });
}

export function readToken(token) {
  try {
    return jwt.verify(token, secret); 
     {/*.verify() => checks
      Is the signature valid?
     Has the token expired?
      Was it signed using my secret?*/}

  } catch {
    return null;
  }
}