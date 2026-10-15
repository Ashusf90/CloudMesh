
const getStorageConfig = () => {
  const baseUrl = process.env.STORAGE_NODE_1_URL;
  const secret = process.env.STORAGE_NODE_SECRET;

  if (!baseUrl || !secret) {
    throw new Error("Storage node configuration is missing");
  }

  return {
    baseUrl: baseUrl.replace(/\/+$/, ""),
    secret,
  };
};

type StoredChunk = {
  chunkId: string;
  size: number;
  nodeId: string;
};

export const uploadChunkToNode = async (
  data: Buffer
): Promise<StoredChunk> => {
  const { baseUrl, secret } = getStorageConfig();

  const form = new FormData();
  form.append("chunk", new Blob([new Uint8Array(data)]), "chunk.bin");

  const response = await fetch(`${baseUrl}/chunks`, {
    method: "POST",
    headers: { "x-storage-node-secret": secret },
    body: form,
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(`Storage upload failed: HTTP ${response.status}`);
  }

  const result = (await response.json()) as {
    success: boolean;
    data?: StoredChunk;
  };

  if (
    !result.success ||
    !result.data?.chunkId ||
    !result.data.nodeId ||
    result.data.size !== data.length
  ) {
    throw new Error("Storage node returned an invalid upload response");
  }

  return result.data;
};

export const deleteChunkFromNode = async (
  chunkId: string
): Promise<void> => {
  const { baseUrl, secret } = getStorageConfig();

  const response = await fetch(
    `${baseUrl}/chunks/${encodeURIComponent(chunkId)}`,
    {
      method: "DELETE",
      headers: { "x-storage-node-secret": secret },
      signal: AbortSignal.timeout(15_000),
    }
  );

  if (!response.ok && response.status !== 404) {
    throw new Error(`Storage deletion failed: HTTP ${response.status}`);
  }
};

export const downloadChunkFromNode = async (
  nodeId: string,
  chunkId: string
): Promise<Buffer> => {
  if (nodeId !== "node-1") {
    throw new Error(`Unsupported storage node: ${nodeId}`);
  }

  const { baseUrl, secret } = getStorageConfig();

  const response = await fetch(
    `${baseUrl}/chunks/${encodeURIComponent(chunkId)}`,
    {
      method: "GET",
      headers: {
        "x-storage-node-secret": secret,
      },
      signal: AbortSignal.timeout(15_000),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Storage download failed: HTTP ${response.status}`
    );
  }

  const data = await response.arrayBuffer();
  return Buffer.from(data);
};
