import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

const PORT = Number(process.env.PORT) || 6001;

app.listen(PORT, () => {
  console.log(
    `CloudMesh Storage Node ${process.env.NODE_ID} running on port ${PORT}`
  );
});