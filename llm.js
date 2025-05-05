import pkg from 'openai';
const { OpenAI } = pkg;
import { MODELS } from "./constants.js";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is not set");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Sends a chat prompt to the LLM.
 * @param {string} prompt - The user prompt
 * @returns {Promise<string>} - The LLM response content
 */
export async function chat(prompt) {
  try {
    const res = await openai.chat.completions.create({
      model: MODELS.chat,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });
    return res.choices[0].message.content;
  } catch (err) {
    console.error("[LLM Chat Error]", err);
    throw new Error("LLM call failed");
  }
}


/**
 * Embeds a string into a vector.
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} - Embedding vector
 */
export async function embed(text) {
  const res = await openai.embeddings.create({
    model: MODELS.embedding,
    input: text,
  });
  return res.data[0].embedding;
}
