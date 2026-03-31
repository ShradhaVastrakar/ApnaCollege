import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import problemRoutes from "./routes/problems.js";
import progressRoutes from "./routes/progress.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 5001;

app.use(
  cors({
    origin:  "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/progress", progressRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

const distPath = path.join(__dirname, "../../frontend/dist");
if (process.env.NODE_ENV === "production" && fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(distPath, "index.html"));
  });
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set");
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log("MongoDB connected");
  app.listen(PORT, () => console.log(`API listening on ${PORT}`));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
