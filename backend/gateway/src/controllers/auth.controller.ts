import type { Request, Response } from "express";
import { registerSchema, loginSchema, } from "../utils/validation.js";
import { registerUser, loginUser,} from "../services/auth.service.js";
import User from "../models/User.js";

export const register = async (
  req: Request,
  res: Response
): Promise<void> => {
  const validationResult = registerSchema.safeParse(req.body);

  if (!validationResult.success) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: validationResult.error.flatten().fieldErrors,
    });

    return;
  }

  try {
    const result = await registerUser(validationResult.data);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong";

    if (message === "An account with this email already exists") {
      res.status(409).json({
        success: false,
        message,
      });

      return;
    }

    console.error("Registration error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  const validationResult = loginSchema.safeParse(req.body);

  if (!validationResult.success) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: validationResult.error.flatten().fieldErrors,
    });

    return;
  }

  try {
    const result = await loginUser(validationResult.data);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong";

    if (message === "Invalid email or password") {
      res.status(401).json({
        success: false,
        message,
      });

      return;
    }

    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const getCurrentUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });

      return;
    }

    const user = await User.findById(req.userId).select(
      "-password"
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });

      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};