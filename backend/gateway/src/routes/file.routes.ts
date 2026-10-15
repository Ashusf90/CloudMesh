
import { Router } from "express";
import multer from "multer";
import { protect } from "../middleware/auth.middleware.js";
import {
  uploadFileController,
  listFilesController,
  downloadFileController
} from "../controllers/file.controller.js";
const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024,
    files: 1,
  },
});

router.post(
  "/upload",
  protect,
  upload.single("file"),
  uploadFileController
);
router.get("/", protect, listFilesController);
router.get("/:fileId/download", protect, downloadFileController);
export default router;
