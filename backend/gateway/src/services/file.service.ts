
import File from "../models/File.js";
import {
  uploadChunkToNode,
  deleteChunkFromNode,
} from "./storage-node.service.js";

const CHUNK_SIZE = 1024 * 1024; // 1 MB

export const uploadFile = async (
  ownerId: string,
  originalName: string,
  mimeType: string,
  buffer: Buffer
) => {
  if (buffer.length === 0) {
    throw new Error("Empty files cannot be uploaded");
  }

  const storedChunks: {
    chunkId: string;
    nodeId: string;
    size: number;
  }[] = [];

  try {
    for (let offset = 0; offset < buffer.length; offset += CHUNK_SIZE) {
      const chunkBuffer = buffer.subarray(
        offset,
        Math.min(offset + CHUNK_SIZE, buffer.length)
      );

      const stored = await uploadChunkToNode(chunkBuffer);

      storedChunks.push({
        chunkId: stored.chunkId,
        nodeId: stored.nodeId,
        size: stored.size,
      });
    }

    const file = await File.create({
      owner: ownerId,
      originalName,
      mimeType,
      size: buffer.length,
      chunks: storedChunks,
    });

    return file;
  } catch (error) {
    // Best-effort cleanup of chunks already stored.
    await Promise.allSettled(
      storedChunks.map((chunk) => deleteChunkFromNode(chunk.chunkId))
    );

    throw error;
  }
};
