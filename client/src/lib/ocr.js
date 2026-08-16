// Free, in-browser OCR via Tesseract.js (WebAssembly). Runs entirely
// client-side — no server, no API key. The worker script and WASM engine
// are self-hosted (client/public/tesseract/) so OCR works even with no
// internet access at all past the initial page load. Only the English
// language model itself (a few MB) still comes from Tesseract.js's default
// CDN on first use, since bundling every language's trained model isn't
// practical — the browser caches it after that first download.
//
// Note: if that language-model fetch fails, Tesseract.js's own internal
// promise chain silently swallows the error and never settles (see
// createWorker.js: `.catch(() => {})` with no corresponding reject for a
// failed `loadLanguage` step). We can't fix that upstream, so every call
// into the worker here is wrapped in our own timeout to guarantee the UI
// always recovers instead of hanging forever.

import { createWorker } from "tesseract.js";

const INIT_TIMEOUT_MS = 30000;
const RECOGNIZE_TIMEOUT_MS = 45000;

const TIMEOUT_MESSAGE =
  "Couldn't read the photo — likely because the one-time OCR language-model download couldn't complete " +
  "(check your internet connection). You can retry, or just fill in the form manually below.";

let workerPromise = null;

function withTimeout(promise, ms, message) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function getWorker() {
  if (!workerPromise) {
    workerPromise = withTimeout(
      createWorker("eng", 1, {
        workerPath: "/tesseract/worker.min.js",
        corePath: "/tesseract/tesseract-core-simd-lstm.wasm.js"
      }),
      INIT_TIMEOUT_MS,
      TIMEOUT_MESSAGE
    );
  }
  return workerPromise;
}

/**
 * @param {string} imageDataUrl - data: URL of the photo
 * @returns {Promise<string>} recognized raw text
 */
export async function recognizeImageText(imageDataUrl) {
  try {
    const worker = await getWorker();
    const { data } = await withTimeout(
      worker.recognize(imageDataUrl, {}, { text: true }),
      RECOGNIZE_TIMEOUT_MS,
      TIMEOUT_MESSAGE
    );
    return data.text || "";
  } catch (err) {
    // Whatever state the worker/init promise is in, it's not usable —
    // drop it so the next attempt spins up a fresh one instead of
    // reusing something broken or still-pending.
    workerPromise = null;
    throw err;
  }
}
