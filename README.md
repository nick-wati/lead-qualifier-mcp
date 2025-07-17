[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/nick-wati-lead-qualifier-mcp-badge.png)](https://mseep.ai/app/nick-wati-lead-qualifier-mcp)

# 🤖 Lead Qualifier MCP Tool

A lightweight MCP tool that uses ChatGPT to qualify leads over BANT mechanism (Budget, Authority, Need, Timeline). And guide users to enter leads informations question by question.



## 🚀 Features

- 🧠 LLM-powered lead qualification info (BANT) extraction and scoring
- 💬 One field per turn, with conversational flow
- 💾 Fast as in-memory session tracking, can be extended to Redis
- 🔌 Compatible with Dify / Cursor via MCP (`sse`)


## ⚙️ Setup

Configure ChatGPT apikey in your .env file.

```bash
OPENAI_API_KEY=1234
```

Start your NodeJS server, which is your MCP server.

```bash
npm install
npm start
```

Optional: expose your server using ngrok

```bash
ngrok http 3001
```

Dify Agent Strategy Configuration
```json
{
  "lead_qualification": {
    "transport": "sse",
    "url": "https://24c3-172-235-53-238.ngrok-free.app/sse",
    "headers": {},
    "timeout": 50,
    "sse_read_timeout": 50
  }
}
```

## 🛠 Example

**Tool name:** `lead-qualifier`  
**Input:**

```json
{
  "sessionId": "abc123",
  "message": "We have a budget of $1000"
}
```

**Output:**
```json
{
  content: [
    {
      type: "text",
      text: "Are you the main person evaluating tools like this, or is there someone else involved in the decision?"
    }
  ],
  isError: false
}
```

**Session:**
```json
{
  "qualificationMap": {
    "budget": "$1000 per month",
    "authority": "",
    "need": "",
    "timeline": ""
  },
  "scoreMap": {
    "budget": 30,
    "authority": 0,
    "need": 0,
    "timeline": 0
  },
  "totalScore": 30,
  "nextField": "authority",
  "lastPromptedField": "authority",
  "lastPromptedQuestion": "Are you the main person evaluating tools like this, or is there someone else involved in the decision?"
}

```

