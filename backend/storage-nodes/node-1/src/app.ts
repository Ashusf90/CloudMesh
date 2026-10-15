import express from "express";
import cors from "cors";
import chunkRoutes from "./routes/chunk.routes.js";
const app = express();

app.use(cors());
app.use(express.json());
app.use("/chunks", chunkRoutes);

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    nodeId: process.env.NODE_ID,
    message: "CloudMesh Storage Node is running",
  });
});

export default app;