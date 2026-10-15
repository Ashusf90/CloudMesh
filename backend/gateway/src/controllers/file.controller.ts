
import type { Request, Response } from "express";
import { uploadFile } from "../services/file.service.js";
import mongoose from "mongoose";
import { downloadChunkFromNode } from "../services/storage-node.service.js";
export const uploadFileController = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.userId) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  if (!req.file) {
    res.status(400).json({
      success: false,
      message: "Please select a file to upload",
    });
    return;
  }

  try {
    const file = await uploadFile(
      req.userId,
      req.file.originalname,
      req.file.mimetype || "application/octet-stream",
      req.file.buffer
    );

    res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      data: {
        id: file.id,
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: file.size,
        chunks: file.chunks.length,
        createdAt: file.createdAt,
      },
    });
  } catch (error) {
    console.error("File upload failed:", error);

    res.status(502).json({
      success: false,
      message: "File upload failed. Please try again.",
    });
  }
};

import File from "../models/File.js";

// Add this function to the existing controller file.
// Keep the existing imports and upload controller.

export const listFilesController = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.userId) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  try {
    const files = await File.find({ owner: req.userId })
      .select("originalName mimeType size chunks createdAt")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: files.length,
      data: files.map((file) => ({
        id: file._id.toString(),
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: file.size,
        chunks: file.chunks.length,
        createdAt: file.createdAt,
      })),
    });
  } catch (error) {
    console.error("List files failed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve files",
    });
  }
};

export const downloadFileController = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.userId) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  if (!mongoose.isValidObjectId(req.params.fileId)) {
    res.status(400).json({
      success: false,
      message: "Invalid file ID",
    });
    return;
  }

  try {
    const file = await File.findOne({
      _id: req.params.fileId,
      owner: req.userId,
    });

    if (!file) {
      res.status(404).json({
        success: false,
        message: "File not found",
      });
      return;
    }

    const chunks: Buffer[] = [];

    for (const chunk of file.chunks) {
      const data = await downloadChunkFromNode(
        chunk.nodeId,
        chunk.chunkId
      );

      if (data.length !== chunk.size) {
        throw new Error("Downloaded chunk size does not match metadata");
      }

      chunks.push(data);
    }

    const buffer = Buffer.concat(chunks);

    if (buffer.length !== file.size) {
      throw new Error("Reconstructed file size does not match metadata");
    }

    res.status(200);
    res.setHeader(
      "Content-Type",
      file.mimeType || "application/octet-stream"
    );
    res.attachment(file.originalName);
    res.send(buffer);
  } catch (error) {
    console.error("File download failed:", error);

    if (!res.headersSent) {
      res.status(502).json({
        success: false,
        message: "Unable to reconstruct the file",
      });
    }
  }
};
