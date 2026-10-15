import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/database.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`
=========================================
🚀 CloudMesh Gateway Started
🌐 http://localhost:${PORT}
=========================================
`);
    });
  } catch (error) {
    console.error(error);
  }
};

startServer();