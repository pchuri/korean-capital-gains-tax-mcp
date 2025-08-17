#!/usr/bin/env node

/**
 * Production server runner
 */

import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function checkBuild() {
  const distPath = join(__dirname, '../dist');
  const serverPath = join(distPath, 'server.js');
  
  try {
    await fs.access(serverPath);
  } catch {
    console.error('❌ Build files not found. Please run "npm run build" first.');
    process.exit(1);
  }
}

async function startServer() {
  await checkBuild();
  
  console.log('🚀 Starting Korean Capital Gains Tax MCP Server...');
  console.log('📊 Ready to calculate capital gains tax');
  console.log('🔌 MCP Server listening on stdio');
  
  // Import and start the server
  const { default: startMcpServer } = await import('../dist/server.js');
  await startMcpServer();
}

startServer().catch((error) => {
  console.error('💥 Failed to start server:', error);
  process.exit(1);
});
