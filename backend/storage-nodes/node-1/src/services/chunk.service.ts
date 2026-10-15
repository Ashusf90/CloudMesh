import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink } from "node:fs/promises";
import path from "node:path";

const storageDirectory = path.resolve(
  process.env.STORAGE_PATH || "./storage"
);

await mkdir(storageDirectory, { recursive: true });

export const saveChunk = async (data: Buffer) => {
  const chunkId = randomUUID();
  const filePath = path.join(storageDirectory, chunkId);

  await import("node:fs/promises").then(({ writeFile }) =>
    writeFile(filePath, data, { flag: "wx" })
  );

  return {
    chunkId,
    size: data.length,
    nodeId: process.env.NODE_ID || "node-1",
  };
};

export const getChunk = async (chunkId: string) => {
  return readFile(path.join(storageDirectory, chunkId));
};

export const deleteChunk = async (chunkId: string) => {
  await unlink(path.join(storageDirectory, chunkId));
};