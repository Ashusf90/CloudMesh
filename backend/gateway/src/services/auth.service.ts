import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import type { RegisterInput, LoginInput, } from "../utils/validation.js";

const SALT_ROUNDS = 12;

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is missing in environment variables");
  }

  return secret;
};
export const registerUser = async (input: RegisterInput) => {
  const existingUser = await User.findOne({
    email: input.email,
  });

  if (existingUser) {
    throw new Error("An account with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(
    input.password,
    SALT_ROUNDS
  );

  const user = await User.create({
    name: input.name,
    email: input.email,
    password: hashedPassword,
  });

  const token = jwt.sign(
    {
      userId: user._id.toString(),
    },
    getJwtSecret(),
    {
      expiresIn: "7d",
    }
  );

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
    },
    token,
  };
};
export const loginUser = async (input: LoginInput) => {
  const user = await User.findOne({
    email: input.email,
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(
    input.password,
    user.password
  );

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  const token = jwt.sign(
    {
      userId: user._id.toString(),
    },
    getJwtSecret(),
    {
      expiresIn: "7d",
    }
  );

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
    },
    token,
  };  
};

