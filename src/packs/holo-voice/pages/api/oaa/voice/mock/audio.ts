// pages/api/oaa/voice/mock/audio.ts
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Returns a 1-second silent WAV so the audio element can "play" while visemes animate.
 * Replace with your real TTS audio streaming endpoint.
 */
export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  const sampleRate = 8000;
  const durationSec = 1;
  const numSamples = sampleRate * durationSec;
  const headerSize = 44;
  const dataSize = numSamples * 2; // 16-bit mono

  const buffer = Buffer.alloc(headerSize + dataSize);
  // RIFF/WAV header
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4); // file size - 8
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // PCM chunk size
  buffer.writeUInt16LE(1, 20);  // PCM
  buffer.writeUInt16LE(1, 22);  // mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28); // byte rate
  buffer.writeUInt16LE(2, 32);  // block align
  buffer.writeUInt16LE(16, 34); // bits per sample
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);
  // silence data already zeroed
  res.setHeader("Content-Type", "audio/wav");
  res.send(buffer);
}
