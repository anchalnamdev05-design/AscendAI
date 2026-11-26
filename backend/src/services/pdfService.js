import { PDFParse } from "pdf-parse";
import { ApiError } from "../utils/ApiError.js";

const MIN_CHARS = 100;

// Sirf extension/MIME pe bharosa nahi: file ke magic bytes ("%PDF-") bhi check karte hain
export async function extractResumeText(buffer) {
  if (!buffer || buffer.length < 5 || buffer.subarray(0, 5).toString("latin1") !== "%PDF-") {
    throw new ApiError(400, "Ye valid PDF file nahi hai");
  }

  let text = "";
  let pages = 0;
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const result = await parser.getText();
    text = (result.text || "")
      .replace(/-- \d+ of \d+ --/g, "")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    pages = result.total || result.pages?.length || 0;
  } catch {
    throw new ApiError(
      400,
      "PDF read nahi ho paayi. File corrupt ya password-protected ho sakti hai",
    );
  } finally {
    await parser.destroy().catch(() => {});
  }

  if (text.length < MIN_CHARS) {
    throw new ApiError(
      422,
      "PDF se text nahi nikal paaya. Shayad ye scanned/image PDF hai. Text-based PDF upload karo",
    );
  }
  return { text, pages, charCount: text.length };
}
