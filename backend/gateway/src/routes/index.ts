
import { Router } from "express";
import authRoutes from "./auth.routes.js";
import fileRoutes from "./file.routes.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "CloudMesh Gateway is running",
  });
});

router.use("/auth", authRoutes);
router.use("/files", fileRoutes);

export default router;
