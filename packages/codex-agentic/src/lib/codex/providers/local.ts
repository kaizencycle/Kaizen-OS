/**
 * Local Provider Adapter
 * Connects to local LLM inference (Ollama/Llama.cpp)
 */

import type { CodexVote, CodexRequest } from '../../../types';

export async function callLocal(prompt: string, req?: CodexRequest): Promise<CodexVote> {
  // TODO: Implement with Ollama or Llama.cpp API
  // Example implementation for Ollama:
  // const response = await fetch(process.env.OLLAMA_URL || 'http://localhost:11434/api/chat', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     model: process.env.OLLAMA_MODEL || 'llama3.1:8b-instruct-q4_K_M',
  //     messages: [{ role: 'user', content: prompt }],
  //     stream: false,
  //   }),
  // });
  // const data = await response.json();
  // return {
  //   provider: 'local',
  //   output: data.message?.content || String(data?.response || ''),
  //   usage: {
  //     prompt: data.prompt_eval_count ?? 0,
  //     completion: data.eval_count ?? 0,
  //   },
  // };

  // Stub implementation for now
  return {
    provider: 'local',
    output: `[Local] Response to: ${prompt.substring(0, 50)}...`,
    usage: { prompt: 100, completion: 50 },
  };
}
