# @kjaniec-dev/ui-mcp

Model Context Protocol (MCP) server for the KJ Product Kit design system and UI components. This server allows AI agents (like Antigravity, Claude, Cursor, and Codex) to browse design tokens, query style definitions, and read React component reference sheets directly.

## Features

- **List Components**: Fetch all React components available in the UI library, along with their one-line descriptions and variant groups.
- **Get Component**: Get component details, including custom properties, JSDoc definitions, CVA variants and options, and minimal usage snippets pulled from the story files.
- **Search Components**: Perform keyword search matching component names, descriptions, and use-cases to find the right component.
- **Get Design Tokens**: Retrieve semantic design tokens by category (color, radius, shadow, font) including light/dark values and the Tailwind utility classes they map to.
- **Get Setup**: Retrieve package installation commands and the required CSS `@import` order.

## Resources

- `design://tokens`: Raw tokens JSON data.
- `ui://components/index`: Generated components index in markdown format.
- `ui://component/{name}`: Dynamic per-component reference docs in markdown format.

## Configuration

To integrate this server with your AI assistant, configure your MCP client.

### Client Configuration

Add this server configuration to your MCP config file (e.g. Cursor's MCP settings, Claude Desktop, or your local `.mcp.json`):

```json
{
  "mcpServers": {
    "kj-ui": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@kjaniec-dev/ui-mcp"]
    }
  }
}
```

### Local Development Configuration

To test your local changes, point your client configuration to the built index file:

```json
{
  "mcpServers": {
    "kj-ui-local": {
      "type": "stdio",
      "command": "node",
      "args": ["~/ui-kit/packages/mcp/dist/index.js"]
    }
  }
}
```

## Local Development

From the repository root:

```bash
# Install dependencies
npm install

# Build the MCP package (extracts component metadata and builds server)
npm run mcp:build

# Run tests
npm run mcp:test

# Start in development watch mode
npm run mcp:dev
```
