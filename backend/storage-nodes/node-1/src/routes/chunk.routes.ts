
import { Router } from "express";
import multer from "multer";
import { validate as isUuid } from "uuid";
import {
  saveChunk,
  getChunk,
  deleteChunk,
} from "../services/chunk.service.js";
import { requireInternalSecret } from "../middleware/internal-auth.middleware.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.use(requireInternalSecret);

router.post("/", upload.single("chunk"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({
      success: false,
      message: "A chunk file is required",
    });
    return;
  }

  try {
    const result = await saveChunk(req.file.buffer);

    res.status(201).json({
      success: true,
      message: "Chunk stored successfully",
      data: result,
    });
  } catch (error) {
    console.error("Save chunk error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to store chunk",
    });
  }
});

router.get("/:chunkId", async (req, res) => {
  const chunkId = req.params.chunkId;

  if (!isUuid(chunkId)) {
    res.status(400).json({
      success: false,
      message: "Invalid chunk ID",
    });
    return;
  }

  try {
    const chunk = await getChunk(chunkId);
    res.status(200).type("application/octet-stream").send(chunk);
  } catch {
    res.status(404).json({
      success: false,
      message: "Chunk not found",
    });
  }
});

router.delete("/:chunkId", async (req, res) => {
  const chunkId = req.params.chunkId;

  if (!isUuid(chunkId)) {
    res.status(400).json({
      success: false,
      message: "Invalid chunk ID",
    });
    return;
  }

  try {
    await deleteChunk(chunkId);
    res.status(200).json({
      success: true,
      message: "Chunk deleted successfully",
    });
  } catch {
    res.status(404).json({
      success: false,
      message: "Chunk not found",
    });
  }
});

export default router;
