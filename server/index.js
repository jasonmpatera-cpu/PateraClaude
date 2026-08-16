import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import extractRouter from "./routes/extract.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8787;

app.use(cors());
app.use(express.json({ limit: "15mb" }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, hasApiKey: Boolean(process.env.ANTHROPIC_API_KEY) });
});

app.use("/api", extractRouter);

app.listen(port, () => {
  console.log(`PREVENT suite server listening on http://localhost:${port}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn(
      "WARNING: ANTHROPIC_API_KEY is not set. Copy server/.env.example to server/.env and add your key."
    );
  }
});
