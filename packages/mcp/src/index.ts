import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data directory is located at ../data relative to dist/index.js
const dataDir = path.join(__dirname, "../data");
const componentsJsonPath = path.join(dataDir, "components.json");
const tokensJsonPath = path.join(dataDir, "tokens.json");

let components: any[] = [];
let tokens: any[] = [];

try {
  if (fs.existsSync(componentsJsonPath)) {
    components = JSON.parse(fs.readFileSync(componentsJsonPath, "utf8"));
  } else {
    console.error(`Warning: components.json not found at ${componentsJsonPath}. Run 'npm run build' first.`);
  }
  
  if (fs.existsSync(tokensJsonPath)) {
    tokens = JSON.parse(fs.readFileSync(tokensJsonPath, "utf8"));
  } else {
    console.error(`Warning: tokens.json not found at ${tokensJsonPath}. Run 'npm run build' first.`);
  }
} catch (error) {
  console.error("Error loading component/token metadata files:", error);
}

const server = new McpServer({
  name: "kj-product-kit-ui-mcp",
  version: "0.4.0",
});

// Helper function to generate reference markdown for a component
function generateComponentMarkdown(c: any): string {
  let md = `# ${c.name}\n\n`;
  md += `${c.description}\n\n`;
  
  md += `## Import\n\`\`\`tsx\n${c.importPath}\n\`\`\`\n\n`;
  
  if (c.props && c.props.length > 0) {
    md += `## Props\n\n`;
    md += "| Prop | Type | Optional | Default | Description |\n";
    md += "| --- | --- | --- | --- | --- |\n";
    for (const p of c.props) {
      const opt = p.optional ? "Yes" : "No";
      const def = p.defaultValue !== null ? `\`${p.defaultValue}\`` : "-";
      md += `| \`${p.name}\` | \`${p.type}\` | ${opt} | ${def} | ${p.description || "-"} |\n`;
    }
    md += "\n";
  }

  if (c.cva) {
    md += `## Style Variants (CVA)\n\n`;
    for (const group of Object.keys(c.cva.variants)) {
      md += `### ${group}\n`;
      md += `Options: ${c.cva.variants[group].map((v: string) => `\`"${v}"\``).join(", ")}\n\n`;
    }
    
    if (Object.keys(c.cva.defaultVariants).length > 0) {
      md += `**Default Variants:**\n`;
      for (const group of Object.keys(c.cva.defaultVariants)) {
        md += `- \`${group}\`: \`"${c.cva.defaultVariants[group]}"\`\n`;
      }
      md += "\n";
    }
  }

  if (c.usageSnippet) {
    md += `## Usage Example\n\`\`\`tsx\n${c.usageSnippet}\n\`\`\`\n`;
  }

  return md;
}

// --- TOOLS IMPLEMENTATION ---

// 1. list_components
server.tool(
  "list_components",
  "List all React components available in the UI library. Provides component names, descriptions, and variant groups.",
  {},
  async () => {
    const list = components.map(c => ({
      name: c.name,
      description: c.description,
      variants: c.cva ? Object.keys(c.cva.variants) : []
    }));

    return {
      content: [{
        type: "text",
        text: JSON.stringify(list, null, 2)
      }]
    };
  }
);

// 2. get_component
server.tool(
  "get_component",
  "Get details of a specific component including its imports, props table, style variants, and usage snippet.",
  {
    name: z.string().describe("The name of the component (e.g. 'Button', 'Alert'). Case-insensitive.")
  },
  async ({ name }) => {
    const cleanName = name.toLowerCase();
    const comp = components.find(c => c.name.toLowerCase() === cleanName);
    
    if (!comp) {
      return {
        content: [{
          type: "text",
          text: `Component "${name}" not found.`
        }]
      };
    }

    const md = generateComponentMarkdown(comp);
    return {
      content: [{
        type: "text",
        text: md
      }]
    };
  }
);

// 3. search_components
server.tool(
  "search_components",
  "Search the component library to find components matching keywords in names, descriptions, props, or usage snippets.",
  {
    query: z.string().describe("The search term or description of the use-case (e.g., 'avatar cluster', 'input with icon', 'interactive link').")
  },
  async ({ query }) => {
    const q = query.toLowerCase();
    const results = components.filter(c => {
      const nameMatch = c.name.toLowerCase().includes(q);
      const descMatch = c.description.toLowerCase().includes(q);
      const propMatch = c.props.some((p: any) => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)));
      const usageMatch = c.usageSnippet && c.usageSnippet.toLowerCase().includes(q);
      return nameMatch || descMatch || propMatch || usageMatch;
    });

    if (results.length === 0) {
      return {
        content: [{
          type: "text",
          text: `No components matched the query "${query}".`
        }]
      };
    }

    const matchedList = results.map(c => ({
      name: c.name,
      description: c.description,
      importPath: c.importPath
    }));

    return {
      content: [{
        type: "text",
        text: JSON.stringify(matchedList, null, 2)
      }]
    };
  }
);

// 4. get_tokens
server.tool(
  "get_tokens",
  "Get the design tokens filtered optionally by category (e.g. 'color', 'radius', 'shadow', 'font'). Returns light/dark values and Tailwind utility mapping.",
  {
    category: z.string().optional().describe("Optional token category filter, e.g. 'color', 'radius', 'shadow', 'font'.")
  },
  async ({ category }) => {
    let filteredTokens = tokens;
    if (category) {
      const cat = category.toLowerCase();
      filteredTokens = tokens.filter(t => t.category.startsWith(cat) || t.name.startsWith(cat));
    }

    return {
      content: [{
        type: "text",
        text: JSON.stringify(filteredTokens, null, 2)
      }]
    };
  }
);

// 5. get_setup
server.tool(
  "get_setup",
  "Get setup details for the design kit, including npm installation instructions and CSS import order.",
  {},
  async () => {
    const setup = {
      installCommand: "npm install @kjaniec-dev/ui @kjaniec-dev/design",
      requiredImports: [
        `@import "@kjaniec-dev/design/tailwind.css"; /* registers all --kj-* tokens as Tailwind utilities */`,
        `@import "@kjaniec-dev/ui/ui.css";           /* imports component-specific layouts and styles */`
      ],
      description: "In Tailwind v4, registering these imports in your root CSS automatically sets up background, border-radius, shadows, and color utilities."
    };

    return {
      content: [{
        type: "text",
        text: JSON.stringify(setup, null, 2)
      }]
    };
  }
);

// --- RESOURCES IMPLEMENTATION ---

// 1. Raw tokens.json
server.resource(
  "tokens",
  "design://tokens",
  { mimeType: "application/json" },
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: JSON.stringify(tokens, null, 2)
    }]
  })
);

// 2. Generated components index (markdown)
server.resource(
  "components-index",
  "ui://components/index",
  { mimeType: "text/markdown" },
  async (uri) => {
    let md = "# Component Index\n\n";
    md += "A complete index of all exported UI components available in the `@kjaniec-dev/ui` library.\n\n";
    md += "| Component | Import Statement | Description |\n";
    md += "| --- | --- | --- |\n";
    for (const c of components) {
      md += `| **[${c.name}](ui://component/${c.name.toLowerCase()})** | \`${c.importPath}\` | ${c.description} |\n`;
    }
    return {
      contents: [{
        uri: uri.href,
        text: md
      }]
    };
  }
);

// 3. Dynamic per-component reference docs (markdown)
server.resource(
  "component-docs",
  new ResourceTemplate("ui://component/{name}", { list: undefined }),
  async (uri, { name }) => {
    const nameStr = Array.isArray(name) ? name[0] : name;
    const cleanName = nameStr.toLowerCase();
    const comp = components.find(c => c.name.toLowerCase() === cleanName);
    
    if (!comp) {
      throw new Error(`Component "${nameStr}" not found.`);
    }

    const md = generateComponentMarkdown(comp);
    return {
      contents: [{
        uri: uri.href,
        text: md,
        mimeType: "text/markdown"
      }]
    };
  }
);

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("KJ UI MCP server running on stdio transport.");
}

run().catch((error) => {
  console.error("Fatal error starting MCP server:", error);
  process.exit(1);
});
