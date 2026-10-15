
import type { Request, Response, NextFunction } from "express";
import { timingSafeEqual } from "node:crypto";

export const requireInternalSecret = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const expectedSecret = process.env.STORAGE_NODE_SECRET;
  const suppliedSecret = req.get("x-storage-node-secret");

  if (!expectedSecret) {
    res.status(503).json({
      success: false,
      message: "Storage node authentication is not configured",
    });
    return;
  }

  if (!suppliedSecret) {
    res.status(401).json({
      success: false,
      message: "Internal authentication required",
    });
    return;
  }

  const expected = Buffer.from(expectedSecret);
  const supplied = Buffer.from(suppliedSecret);

  if (
    expected.length !== supplied.length ||
    !timingSafeEqual(expected, supplied)
  ) {
    res.status(403).json({
      success: false,
      message: "Invalid internal credentials",
    });
    return;
  }

  next();
};
