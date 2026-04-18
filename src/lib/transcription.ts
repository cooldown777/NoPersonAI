import OpenAI from "openai";

export const MAX_AUDIO_SECONDS = 120;
export const MAX_AUDIO_BYTES = 25 * 1024 * 1024;

export interface TranscriptionResult {
  text: string;
  language: "de" | "en";
  durationSeconds?: number;
}

let _client: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_client) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _client;
}

function normalizeLanguage(raw: string | undefined | null): "de" | "en" {
  if (!raw) return "en";
  const lower = raw.toLowerCase();
  if (lower.startsWith("de") || lower.includes("german") || lower.includes("deutsch")) return "de";
  return "en";
}

export async function transcribe(
  audio: File | Blob,
  filename: string = "audio.ogg",
): Promise<TranscriptionResult> {
  if (audio.size > MAX_AUDIO_BYTES) {
    throw new Error(`Audio too large (${audio.size} bytes). Max ${MAX_AUDIO_BYTES}.`);
  }

  const file =
    audio instanceof File
      ? audio
      : new File([audio], filename, { type: audio.type || "audio/ogg" });

  const response = await getOpenAI().audio.transcriptions.create({
    file,
    model: "whisper-1",
    response_format: "verbose_json",
  });

  return {
    text: response.text.trim(),
    language: normalizeLanguage(response.language),
    durationSeconds: response.duration,
  };
}
