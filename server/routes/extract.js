import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { EXTRACTION_TOOL, SYSTEM_PROMPT } from "../lib/extractionSchema.js";

const router = Router();

router.post("/extract", async (req, res) => {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({
        error:
          "Server is missing ANTHROPIC_API_KEY. Add it to server/.env and restart the server."
      });
    }

    const { imageDataUrl, proseText } = req.body || {};

    if (!imageDataUrl && !proseText) {
      return res
        .status(400)
        .json({ error: "Provide an image, prose text, or both." });
    }

    const content = [];

    if (proseText && proseText.trim()) {
      content.push({
        type: "text",
        text: `Free-text / dictated patient notes:\n"""${proseText.trim()}"""`
      });
    }

    if (imageDataUrl) {
      const match = /^data:(image\/[a-zA-Z+]+);base64,(.+)$/.exec(imageDataUrl);
      if (!match) {
        return res.status(400).json({ error: "Invalid image data URL." });
      }
      const [, mediaType, base64Data] = match;
      content.push({
        type: "image",
        source: { type: "base64", media_type: mediaType, data: base64Data }
      });
      content.push({
        type: "text",
        text: "Extract all available fields from the lab report image above."
      });
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      tools: [EXTRACTION_TOOL],
      tool_choice: { type: "tool", name: EXTRACTION_TOOL.name },
      messages: [{ role: "user", content }]
    });

    const toolUse = response.content.find((block) => block.type === "tool_use");

    if (!toolUse) {
      return res.status(502).json({ error: "Extraction failed: no structured result returned." });
    }

    res.json({ data: toolUse.input });
  } catch (err) {
    console.error("Extraction error:", err);
    res.status(500).json({ error: err.message || "Extraction failed." });
  }
});

export default router;
