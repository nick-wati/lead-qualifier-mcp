#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

import express from "express";
import dotenv from "dotenv";import { TOOL_DEFINITIONS } from './constants.js';

import { runLeadQualifier } from './tools/lead-qualifier.js';
import { syncLeadToCRM } from './tools/crm-sync.js';

// Load environment variables from .env file
dotenv.config();

const {
  OPENAI_API_KEY,
  MCP_PROTOCOL_VERSION = '2024-11-05',
  PORT = 3001,
} = process.env;

if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set');
}

const app = express();

// Health check endpoint for monitoring
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

const server = new Server(
  {
    name: 'lead-qualification/mcp',
    version: '0.1.0',
    protocolVersion: MCP_PROTOCOL_VERSION
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Track active SSE transport for message handling
let activeTransport = null;

server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.log("Listing tools");
  return { tools: TOOL_DEFINITIONS };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  console.log("[%s]Calling tool", args.sessionId, name, args);

  try {
    if (name === 'lead-qualifier') {
      const result = await runLeadQualifier(args.sessionId, args.message);
      return { content: [{ type: 'text', text: result }], isError: false };
    }

    if (name === 'crm-sync-agent') {
      const response = await syncLeadToCRM(args.lead);
      return { content: [{ type: 'text', text: JSON.stringify(response) }], isError: false };
    }

    if (name === 'clear-session') {
      clearSession(args.sessionId);
      return { content: [{ type: 'text', text: 'Session cleared' }], isError: false };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (err) {
    return {
      content: [{ type: 'text', text: `Error: ${err.message}` }],
      isError: true,
    };
  }
});

// SSE endpoint for real-time communication
app.get('/sse', (req, res) => {
  const transport = new SSEServerTransport('/messages', res);
  activeTransport = transport;
  server.connect(transport);
});

// Message handling endpoint for SSE
app.post('/messages', (req, res) => {
  if (activeTransport) {
    activeTransport.handlePostMessage(req, res);
  } else {
    res.status(400).send('No active SSE client');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`MCP server running at http://localhost:${PORT}`);
});
