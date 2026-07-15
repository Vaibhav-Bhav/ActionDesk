/**
 * aiActions.js — Server-side AI action orchestrator.
 *
 * Sprint 4.3: Single entry point for executing any AI action.
 * Orchestrates: promptBuilder → Groq API → artifactFormatter.
 *
 * No duplicated Groq logic — uses a single callGroq() helper.
 * No duplicated prompt logic — delegates to promptBuilder.
 * No duplicated formatting — delegates to artifactFormatter.
 */

import { buildPrompt } from "./promptBuilder";
import { formatArtifact } from "./artifactFormatter";

// ─────────────────────────────────────────────────────────────────────────────
// Groq Call Helper (single source of truth for AI generation calls)
// ─────────────────────────────────────────────────────────────────────────────

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

/**
 * Call Groq API with system + user messages.
 * Returns parsed JSON from the model response.
 *
 * @param {string} system — System prompt
 * @param {string} user — User prompt
 * @returns {Object} Parsed JSON response from the model
 */
async function callGroq(system, user) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set. Add it to your .env.local file.");
  }

  const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Groq returned no content.");
  }

  try {
    return JSON.parse(content);
  } catch {
    throw new Error(`Failed to parse Groq JSON response: ${content.slice(0, 200)}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Execute an AI action for a given card.
 *
 * Pipeline: buildPrompt → callGroq → formatArtifact
 *
 * @param {Object} card — The full action card object
 * @param {string} actionType — The AI action name (e.g. "Draft Formal Quotation")
 * @returns {Object} Structured artifact ready for the preview modal
 */
export async function executeAiAction(card, actionType) {
  // 1. Build the prompt
  const { system, user } = buildPrompt(card, actionType);

  // 2. Call Groq
  const rawResponse = await callGroq(system, user);

  // 3. Format the artifact
  const artifact = formatArtifact(actionType, rawResponse, card);

  return artifact;
}
