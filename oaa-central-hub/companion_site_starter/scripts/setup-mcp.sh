#!/bin/bash

# Setup MCP server dependencies
echo "Setting up OAA MCP server..."

cd oaa-mcp

# Install dependencies
echo "Installing MCP dependencies..."
npm install

# Make the server executable
chmod +x src/index.mjs

echo "MCP server setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure your secrets in Cursor (LEDGER_BASE_URL, LEDGER_ADMIN_TOKEN)"
echo "2. Restart Cursor to load the MCP server"
echo "3. Use @oaa.* tools in Cursor chats"