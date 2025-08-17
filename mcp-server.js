#!/usr/bin/env node

/**
 * Cleaner MCP server runner for production
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Suppress npm output noise
process.env.NPM_CONFIG_LOGLEVEL = 'silent';
process.env.NODE_NO_WARNINGS = '1';

// Import and start the server
const { default: startMcpServer } = await import('./dist/server.js');
await startMcpServer();
