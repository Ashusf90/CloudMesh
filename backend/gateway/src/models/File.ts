
import { Schema, model } from "mongoose";

const fileChunkSchema = new Schema(
  {
    chunkId: {
      type: String,
      required: true,
    },
    nodeId: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const fileSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    chunks: {
      type: [fileChunkSchema],
      required: true,
    },
  },
  { timestamps: true }
);

fileSchema.index({ owner: 1, createdAt: -1 });

const File = model("File", fileSchema);

export default File;
