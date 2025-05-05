export const MODELS = {
  embedding: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small",
  chat: process.env.OPENAI_CHAT_MODEL || "gpt-4o",
};

export const PROMPTS = {
  leadQualificationExtractor: (allfields, lastPromptedQuestion, message) => `
You are a SDR assistant that extracts the lead's qualification info from their message, and provides a confidence score from 0 to 100 based on how strong or qualified their answer is.

Supported qualification fields:
${allfields.join(", ")}

The last question you asked the user was:
${lastPromptedQuestion}

User message:
${message}

Respond with a JSON object like:
{
  "field": "budget",
  "value": "$500 per month",
  "score": 75
}

If you can't find a clear answer, respond with:
{
  "field": "",
  "value": "",
  "score": 0
}
`,
};

export const TOOL_DEFINITIONS = [
  {
    name: "lead-qualifier",
    description: "Extract and collect one lead qualificatino field from the user's latest message.",
    type: "action",
    inputSchema: {
      type: "object",
      properties: {
        sessionId: {
          type: "string",
          description: "The session ID used to track lead qualification collection state."
        },
        message: {
          type: "string",
          description: "The user message used to extract lead qualification information."
        }
      },
      required: ["sessionId", "message"]
    }
  },
  {
    name: "crm-sync-agent",
    description: "Sync lead data to the CRM system.",
    type: "action",
    inputSchema: {
      type: "object",
      properties: {
        lead: { type: "object", description: "The full lead object to be synced." }
      },
      required: ["lead"]
    }
  },
  {
    name: "clear-session",
    description: "Clear lead qualification data for a given session.",
    type: "action",
    inputSchema: {
      type: "object",
      properties: {
        sessionId: { type: "string", description: "Session ID to clear." }
      },
      required: ["sessionId"]
    }
  }
];
