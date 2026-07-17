import ts from "typescript";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function findProjectRoot(): string {
  let dir = __dirname;
  while (dir && dir !== path.parse(dir).root) {
    if (fs.existsSync(path.join(dir, "package.json"))) {
      try {
        const pkg = JSON.parse(fs.readFileSync(path.join(dir, "package.json"), "utf8"));
        if (pkg.name === "kj-product-kit-starter" || pkg.name === "kj-product-kit") {
          return dir;
        }
      } catch (e) {}
    }
    dir = path.dirname(dir);
  }
  dir = process.cwd();
  while (dir && dir !== path.parse(dir).root) {
    if (fs.existsSync(path.join(dir, "package.json"))) {
      try {
        const pkg = JSON.parse(fs.readFileSync(path.join(dir, "package.json"), "utf8"));
        if (pkg.name === "kj-product-kit-starter" || pkg.name === "kj-product-kit") {
          return dir;
        }
      } catch (e) {}
    }
    dir = path.dirname(dir);
  }
  // Ultimate fallback to hardcoded path relative to packages/mcp/src/extractor.ts
  return path.resolve(__dirname, "../../..");
}

const projectRoot = findProjectRoot();
const uiSrcDir = path.join(projectRoot, "packages/ui/src");
const designDir = path.join(projectRoot, "packages/design");
const mcpDir = path.join(projectRoot, "packages/mcp");
const dataOutputDir = path.join(mcpDir, "data");

// Ensure dataOutputDir exists
if (!fs.existsSync(dataOutputDir)) {
  fs.mkdirSync(dataOutputDir, { recursive: true });
}

interface PropInfo {
  name: string;
  type: string;
  optional: boolean;
  defaultValue: string | null;
  description: string;
}

interface CvaInfo {
  variants: Record<string, string[]>;
  defaultVariants: Record<string, string>;
}

interface ComponentInfo {
  name: string;
  importPath: string;
  description: string;
  props: PropInfo[];
  cva: CvaInfo | null;
  usageSnippet: string;
}

function getJSDoc(node: ts.Node, sourceFile: ts.SourceFile): string {
  const comments = ts.getJSDocCommentsAndTags(node);
  if (comments && comments.length > 0) {
    const first = comments[0];
    if (ts.isJSDoc(first)) {
      if (typeof first.comment === "string") {
        return first.comment;
      } else if (Array.isArray(first.comment)) {
        return first.comment.map(c => c.text).join("");
      }
    }
  }
  
  const sourceText = sourceFile.text;
  const ranges = ts.getLeadingCommentRanges(sourceText, node.pos);
  if (ranges && ranges.length > 0) {
    const commentText = sourceText.substring(ranges[0].pos, ranges[0].end);
    return commentText
      .replace(/^\/\*\*?/, "")
      .replace(/\*\/$/, "")
      .split("\n")
      .map(line => line.replace(/^\s*\*?/, "").trim())
      .filter(Boolean)
      .join(" ");
  }
  return "";
}

function parseCvaCall(node: ts.CallExpression): CvaInfo | null {
  if (node.arguments.length < 2) return null;
  const config = node.arguments[1];
  if (!ts.isObjectLiteralExpression(config)) return null;

  const result: CvaInfo = {
    variants: {},
    defaultVariants: {}
  };

  for (const prop of config.properties) {
    if (!ts.isPropertyAssignment(prop)) continue;
    const propName = prop.name.getText();

    if (propName === "variants" && ts.isObjectLiteralExpression(prop.initializer)) {
      for (const variantGroup of prop.initializer.properties) {
        if (!ts.isPropertyAssignment(variantGroup)) continue;
        const groupName = variantGroup.name.getText();
        const options: string[] = [];

        if (ts.isObjectLiteralExpression(variantGroup.initializer)) {
          for (const opt of variantGroup.initializer.properties) {
            if (opt.name) {
              options.push(opt.name.getText().replace(/['"]/g, ""));
            }
          }
        }
        result.variants[groupName] = options;
      }
    }

    if (propName === "defaultVariants" && ts.isObjectLiteralExpression(prop.initializer)) {
      for (const defProp of prop.initializer.properties) {
        if (!ts.isPropertyAssignment(defProp)) continue;
        const groupName = defProp.name.getText();
        const defValue = defProp.initializer.getText().replace(/['"]/g, "");
        result.defaultVariants[groupName] = defValue;
      }
    }
  }

  return result;
}

export function parseComponents(): ComponentInfo[] {
  console.error("Starting component TSX parsing...");

  // 1. Resolve exports from packages/ui/src/index.ts
  const indexFile = path.join(uiSrcDir, "index.ts");
  if (!fs.existsSync(indexFile)) {
    throw new Error(`Entry index.ts not found at: ${indexFile}`);
  }

  const indexCode = fs.readFileSync(indexFile, "utf8");
  const indexSource = ts.createSourceFile("index.ts", indexCode, ts.ScriptTarget.Latest, true);

  interface ExportItem {
    name: string;
    fileRelativePath: string;
  }

  const exports: ExportItem[] = [];

  function visitIndex(node: ts.Node) {
    if (ts.isExportDeclaration(node) && node.moduleSpecifier) {
      const relPath = node.moduleSpecifier.getText().replace(/['"]/g, "");
      if (node.exportClause && ts.isNamedExports(node.exportClause)) {
        for (const element of node.exportClause.elements) {
          const exportName = element.name.getText();
          // Filter only capitalized exports (React components), ignore type-only exports, and ignore Props/Variants/Options/etc.
          if (!element.isTypeOnly && /^[A-Z]/.test(exportName) && !/(Props|Variants|Options|Tone|Option|Align|Size|Variant|Style)$/.test(exportName)) {
            exports.push({
              name: exportName,
              fileRelativePath: relPath
            });
          }
        }
      }
    }
    ts.forEachChild(node, visitIndex);
  }

  visitIndex(indexSource);

  console.error(`Found ${exports.length} exported React components in index.ts.`);

  // 2. Read and cache all story files for extracting usage snippets
  const componentsDir = path.join(uiSrcDir, "components");
  const storyContents: Record<string, string> = {};
  if (fs.existsSync(componentsDir)) {
    const files = fs.readdirSync(componentsDir);
    for (const f of files) {
      if (f.endsWith(".stories.tsx")) {
        storyContents[f] = fs.readFileSync(path.join(componentsDir, f), "utf8");
      }
    }
  }

  // Snippets are lifted verbatim from story source, so lines after the first
  // keep the story file's indentation; re-baseline them to column 0.
  function dedentSnippet(snippet: string): string {
    const lines = snippet.split("\n");
    if (lines.length < 2) return snippet;
    const indents = lines
      .slice(1)
      .filter((l) => l.trim().length > 0)
      .map((l) => (l.match(/^[ \t]*/) as RegExpMatchArray)[0].length);
    if (indents.length === 0) return snippet;
    const indent = Math.min(...indents);
    if (indent === 0) return snippet;
    return [lines[0], ...lines.slice(1).map((l) => (l.trim().length > 0 ? l.slice(indent) : ""))].join("\n");
  }

  function findUsageSnippet(compName: string): string {
    // Try to find a JSX usage of <CompName in all stories
    const jsxRegex = new RegExp(`<${compName}\\b[^]*?(?:/>|</${compName}>)`, "g");
    for (const storyFile of Object.keys(storyContents)) {
      const content = storyContents[storyFile];
      const matches = content.match(jsxRegex);
      if (matches && matches.length > 0) {
        // Find the shortest clean-looking JSX usage snippet
        for (const match of matches) {
          const trimmed = match.trim();
          if (trimmed.length < 250 && !trimmed.includes("PlusIcon")) {
            return dedentSnippet(trimmed);
          }
        }
        return dedentSnippet(matches[0].trim());
      }
    }
    // Fallback default usage snippet
    return `<${compName}>\n  <!-- Content -->\n</${compName}>`;
  }

  // 3. Process each component
  const componentsMap: Record<string, ComponentInfo> = {};

  // Group exports by file path to parse each file once
  const exportsByFile: Record<string, string[]> = {};
  for (const item of exports) {
    const fullPath = path.resolve(uiSrcDir, item.fileRelativePath + ".tsx");
    if (!exportsByFile[fullPath]) {
      exportsByFile[fullPath] = [];
    }
    exportsByFile[fullPath].push(item.name);
  }

  for (const filePath of Object.keys(exportsByFile)) {
    if (!fs.existsSync(filePath)) {
      console.error(`Warning: file not found: ${filePath}`);
      continue;
    }

    const code = fs.readFileSync(filePath, "utf8");
    const sourceFile = ts.createSourceFile(filePath, code, ts.ScriptTarget.Latest, true);

    const compNames = exportsByFile[filePath];
    
    // Find all interface declarations, type alias declarations, cva calls, and parameter destructuring in this file
    const fileInterfaces: Record<string, PropInfo[]> = {};
    let fileCva: CvaInfo | null = null;
    const parameterDefaults: Record<string, Record<string, string>> = {};
    const componentDescriptions: Record<string, string> = {};

    function visitFile(node: ts.Node) {
      // Find JSDoc for component declarations
      if (ts.isVariableStatement(node)) {
        const doc = getJSDoc(node, sourceFile);
        for (const decl of node.declarationList.declarations) {
          const name = decl.name.getText();
          if (compNames.includes(name) && doc) {
            componentDescriptions[name] = doc;
          }
        }
      } else if (ts.isFunctionDeclaration(node) && node.name) {
        const name = node.name.getText();
        if (compNames.includes(name)) {
          const doc = getJSDoc(node, sourceFile);
          if (doc) componentDescriptions[name] = doc;
        }
      }

      // Parse interfaces (e.g. ButtonProps)
      if (ts.isInterfaceDeclaration(node)) {
        const name = node.name.getText();
        const props: PropInfo[] = [];
        for (const member of node.members) {
          if (ts.isPropertySignature(member)) {
            props.push({
              name: member.name.getText(),
              type: member.type ? member.type.getText() : "any",
              optional: member.questionToken !== undefined,
              defaultValue: null,
              description: getJSDoc(member, sourceFile)
            });
          }
        }
        fileInterfaces[name] = props;
      }

      // Parse type aliases (e.g. type ButtonProps = { ... })
      if (ts.isTypeAliasDeclaration(node) && ts.isTypeLiteralNode(node.type)) {
        const name = node.name.getText();
        const props: PropInfo[] = [];
        for (const member of node.type.members) {
          if (ts.isPropertySignature(member)) {
            props.push({
              name: member.name.getText(),
              type: member.type ? member.type.getText() : "any",
              optional: member.questionToken !== undefined,
              defaultValue: null,
              description: getJSDoc(member, sourceFile)
            });
          }
        }
        fileInterfaces[name] = props;
      }

      // Parse cva call
      if (ts.isCallExpression(node) && node.expression.getText() === "cva") {
        const cva = parseCvaCall(node);
        if (cva) {
          fileCva = cva;
        }
      }

      // Parse function parameter default values
      let renderFn: ts.SignatureDeclaration | null = null;
      let targetCompName = "";

      if (ts.isFunctionDeclaration(node) && node.name && compNames.includes(node.name.getText())) {
        renderFn = node;
        targetCompName = node.name.getText();
      } else if (ts.isVariableDeclaration(node) && node.name && compNames.includes(node.name.getText())) {
        targetCompName = node.name.getText();
        if (node.initializer) {
          if (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer)) {
            renderFn = node.initializer;
          } else if (ts.isCallExpression(node.initializer) && node.initializer.expression.getText().includes("forwardRef")) {
            const inner = node.initializer.arguments[0];
            if (inner && (ts.isArrowFunction(inner) || ts.isFunctionExpression(inner))) {
              renderFn = inner;
            }
          }
        }
      }

      if (renderFn && renderFn.parameters.length > 0 && targetCompName) {
        const firstParam = renderFn.parameters[0];
        if (ts.isObjectBindingPattern(firstParam.name)) {
          const defaults: Record<string, string> = {};
          for (const el of firstParam.name.elements) {
            if (ts.isBindingElement(el)) {
              const name = el.propertyName ? el.propertyName.getText() : el.name.getText();
              if (el.initializer) {
                defaults[name] = el.initializer.getText();
              }
            }
          }
          parameterDefaults[targetCompName] = defaults;
        }
      }

      ts.forEachChild(node, visitFile);
    }

    visitFile(sourceFile);

    // Merge everything for the components in this file
    for (const compName of compNames) {
      // Find Props interface (e.g. ButtonProps or CardProps)
      const propsInterfaceName = `${compName}Props`;
      let componentProps = fileInterfaces[propsInterfaceName] || [];

      // If no custom props interface is found, try other matching interfaces
      if (componentProps.length === 0) {
        const fallbackInterface = Object.keys(fileInterfaces).find(k => k.includes(compName));
        if (fallbackInterface) {
          componentProps = fileInterfaces[fallbackInterface];
        }
      }

      // Apply default values from parameter destructuring
      const defaults = parameterDefaults[compName] || {};
      for (const p of componentProps) {
        if (defaults[p.name] !== undefined) {
          p.defaultValue = defaults[p.name];
        }
      }

      // If this file has CVA variants, add them as props if not already defined
      const finalCva = fileCva as any;
      if (finalCva) {
        for (const variantGroup of Object.keys(finalCva.variants)) {
          const existingProp = componentProps.find(p => p.name === variantGroup);
          const typeStr = (finalCva.variants[variantGroup] as string[]).map((v: string) => `"${v}"`).join(" | ");
          const defaultVal = finalCva.defaultVariants[variantGroup] || null;

          if (existingProp) {
            existingProp.type = typeStr;
            if (!existingProp.defaultValue && defaultVal) {
              existingProp.defaultValue = `"${defaultVal}"`;
            }
          } else {
            componentProps.push({
              name: variantGroup,
              type: typeStr,
              optional: true,
              defaultValue: defaultVal ? `"${defaultVal}"` : null,
              description: `Style variant of the component: ${variantGroup}.`
            });
          }
        }
      }

      const importPath = `import { ${compName} } from "@kjaniec-dev/ui";`;
      const usageSnippet = findUsageSnippet(compName);
      const description = componentDescriptions[compName] || `React component ${compName}.`;

      componentsMap[compName] = {
        name: compName,
        importPath,
        description,
        props: componentProps,
        cva: finalCva,
        usageSnippet
      };
    }
  }

  return Object.values(componentsMap);
}

interface ParsedToken {
  name: string;
  category: string;
  light: string;
  dark: string;
  tailwind: string;
}

export function parseTokens(): ParsedToken[] {
  console.error("Starting tokens parsing...");
  const tokensFile = path.join(designDir, "tokens.json");
  const themeFile = path.join(designDir, "src/theme.css");
  const tailwindFile = path.join(designDir, "src/tailwind.css");

  if (!fs.existsSync(tokensFile) || !fs.existsSync(themeFile) || !fs.existsSync(tailwindFile)) {
    throw new Error("Missing design token source files!");
  }

  const tokensRaw = JSON.parse(fs.readFileSync(tokensFile, "utf8"));
  const themeCss = fs.readFileSync(themeFile, "utf8");
  const tailwindCss = fs.readFileSync(tailwindFile, "utf8");

  // 1. Extract Light Mode values from theme.css (inside :root)
  const lightValues: Record<string, string> = {};
  const rootMatch = themeCss.match(/:root\s*\{([^}]*)\}/);
  if (rootMatch) {
    const lines = rootMatch[1].split("\n");
    for (const line of lines) {
      const match = line.match(/^\s*(--kj-[a-zA-Z0-9-]+)\s*:\s*([^;]+);/);
      if (match) {
        lightValues[match[1]] = match[2].trim();
      }
    }
  }

  // 2. Extract Dark Mode values from theme.css (inside .dark)
  const darkValues: Record<string, string> = {};
  const darkMatch = themeCss.match(/\.dark\s*\{([^}]*)\}/);
  if (darkMatch) {
    const lines = darkMatch[1].split("\n");
    for (const line of lines) {
      const match = line.match(/^\s*(--kj-[a-zA-Z0-9-]+)\s*:\s*([^;]+);/);
      if (match) {
        darkValues[match[1]] = match[2].trim();
      }
    }
  }

  // 3. Extract Tailwind Utility Mapping from tailwind.css (inside @theme)
  const tailwindThemeMappings: Record<string, string> = {};
  const themeBlockMatch = tailwindCss.match(/@theme\s*\{([^}]*)\}/);
  if (themeBlockMatch) {
    const lines = themeBlockMatch[1].split("\n");
    for (const line of lines) {
      const match = line.match(/^\s*(--[a-zA-Z0-9-]+)\s*:\s*var\((--kj-[a-zA-Z0-9-]+)\)/);
      if (match) {
        tailwindThemeMappings[match[2]] = match[1];
      }
    }
  }

  // Helper to map css var name to tailwind utility
  function getTailwindUtility(kjVarName: string): string {
    const twVar = tailwindThemeMappings[kjVarName];
    if (!twVar) return "";
    
    // Map tailwind variables to utility prefixes:
    // e.g. --color-primary -> bg-primary, text-primary, border-primary
    // e.g. --radius-kj-sm -> rounded-kj-sm
    // e.g. --shadow-kj-sm -> shadow-kj-sm
    // e.g. --font-sans -> font-sans
    if (twVar.startsWith("--color-")) {
      const colorName = twVar.replace("--color-", "");
      return `bg-${colorName} / text-${colorName}`;
    }
    if (twVar.startsWith("--radius-")) {
      const radiusName = twVar.replace("--radius-", "");
      return `rounded-${radiusName}`;
    }
    if (twVar.startsWith("--shadow-")) {
      const shadowName = twVar.replace("--shadow-", "");
      return `shadow-${shadowName}`;
    }
    if (twVar.startsWith("--font-")) {
      const fontName = twVar.replace("--font-", "");
      return `font-${fontName}`;
    }
    return twVar;
  }

  const parsedTokens: ParsedToken[] = [];

  // Recurse W3C Design Tokens JSON
  function recurseTokens(obj: any, pathArray: string[]) {
    if (!obj || typeof obj !== "object") return;
    
    if (obj["$type"] && obj["$value"] !== undefined) {
      const tokenName = pathArray.join(".");
      let category = pathArray[0];
      if (category === "color") {
        category = pathArray[1] === "primitive" ? "color-primitive" : "color";
      }

      // Convert path array to corresponding css variable:
      // e.g. ["color", "secondary", "hover"] -> --kj-secondary-hover
      // e.g. ["radius", "sm"] -> --kj-radius-sm
      // e.g. ["color", "primitive", "teal", "500"] -> we don't map primitives to semantic theme unless requested,
      // but let's resolve the variable name:
      let varName = "--kj-";
      if (pathArray[0] === "color") {
        if (pathArray[1] === "primitive") {
          varName += `${pathArray[2]}-${pathArray[3]}`;
        } else {
          varName += pathArray.slice(1).join("-");
        }
      } else {
        varName += pathArray.join("-");
      }

      const light = lightValues[varName] || obj["$value"];
      const dark = darkValues[varName] || light; // default to light value if no dark override
      const tailwind = getTailwindUtility(varName) || "";

      parsedTokens.push({
        name: tokenName,
        category,
        light,
        dark,
        tailwind
      });
      return;
    }

    for (const key of Object.keys(obj)) {
      if (key.startsWith("$")) continue;
      recurseTokens(obj[key], [...pathArray, key]);
    }
  }

  recurseTokens(tokensRaw, []);
  console.error(`Parsed ${parsedTokens.length} tokens.`);
  return parsedTokens;
}

export function generate() {
  console.error("Starting generation step...");
  
  // Parse components and tokens
  const components = parseComponents();
  const tokens = parseTokens();

  // Write outputs
  fs.writeFileSync(
    path.join(dataOutputDir, "components.json"),
    JSON.stringify(components, null, 2)
  );

  fs.writeFileSync(
    path.join(dataOutputDir, "tokens.json"),
    JSON.stringify(tokens, null, 2)
  );

  console.error("Successfully generated components.json and tokens.json inside packages/mcp/data/.");
}
