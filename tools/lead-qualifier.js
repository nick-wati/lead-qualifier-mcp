import { chat } from "../llm.js";
import { PROMPTS } from "../constants.js";

// TODO: support sessions from Redis
const sessions = new Map();

const weights = {
  budget: 30,
  authority: 20,
  need: 30,
  timeline: 20,
};

const allFields = ["budget", "authority", "need", "timeline"];

// TODO: move this to Redis cache per tenant/language
const leadQualificationQuestions = {
  budget: "What monthly budget range are you considering for a solution like this? (e.g., under $100, $100–$500, $500+)",
  authority: "Are you the main person evaluating tools like this, or is there someone else involved in the decision?",
  need: "What specific problems are you hoping to solve with a solution like this?",
  timeline: "When are you looking to implement a solution?"
};

function getSession(sessionId) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      qualificationMap: {},
      scoreMap: {},
      totalScore: 0,
      nextField: allFields[0],
      lastPromptedField: null
    });
  }
  return sessions.get(sessionId);
}

function getMissingFields(session) {
  return allFields.filter((field) => !session.qualificationMap[field]);
}

function updateSession(sessionId, { field, value, score, nextField, lastPromptedQuestion }) {
  const session = getSession(sessionId);

  if (field) {
    const weight = weights[field] ?? 0;
    const weightedScore = Math.round(score * weight / 100);
    const prevScore = session.scoreMap[field] ?? 0;

    session.totalScore = (session.totalScore ?? 0) - prevScore + weightedScore;
    session.qualificationMap[field] = value;
    session.scoreMap[field] = weightedScore;
  }

  session.nextField = nextField;
  session.lastPromptedQuestion = lastPromptedQuestion;
}

function printSession(sessionId) {
  console.log("[%s]Session: %s", sessionId, JSON.stringify(getSession(sessionId), null, 2));
}

/**
 * Main function to run the lead qualifier
 */
export async function runLeadQualifier(sessionId, message) {
  console.log("[%s]Running lead qualifier - %s", sessionId, message);

  const session = getSession(sessionId);

  // Step 1: Extract qualification info from message
  const prompt = PROMPTS.leadQualificationExtractor(allFields, session.lastPromptedQuestion, message);

  const response = await chat(prompt);
  let parsed;
  try {
    const cleaned = response.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/, "");
    parsed = JSON.parse(cleaned);
  } catch (err) {
    console.error("[%s][LLM]Failed to parse LLM response:", sessionId, response);
    printSession(sessionId);
    return "Sorry, I couldn’t understand your response. Could you rephrase?"
  }

  const { field, value, score } = parsed;
  if (!field || !value || typeof score !== "number") {
    console.log("[%s][LLM]Cannot extract valid info from message: %s", sessionId, message);
  } else {
    console.log("[%s][LLM]Extracted info from message: %s", sessionId, JSON.stringify({ field, value, score }, null, 2));
  }

  // Step 2:  Get next follow-up question
  const missingFields = getMissingFields(session);
  const nextField = missingFields.filter((f) => f !== field)[0] || null;
  const nextFieldQuestion = nextField ? leadQualificationQuestions[nextField] : null;

  // Step 3: Update session
  updateSession(sessionId, {
    field, value, score, nextField, lastPromptedQuestion: nextFieldQuestion
  });

  const result = nextFieldQuestion
    ? nextFieldQuestion
    : "Thanks! I’ve collected everything I need for now."

  printSession(sessionId);
  return result;
}

export function clearSession(sessionId) {
  sessions.delete(sessionId);
  printSession(sessionId);
}
