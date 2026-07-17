# Timeline Stories & MCP Metadata Generation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create Storybook stories for the Timeline component, rebuild the UI package to regenerate the MCP component registry metadata, verify the generation, and commit both files.

**Architecture:** We will add a new stories file `timeline.stories.tsx` containing three stories: MinimalLog, RichFeed, and Alternating. Then we run `npm run build` from the workspace root which triggers the tsx extraction and updates `packages/mcp/data/components.json`.

**Tech Stack:** React, Storybook, Vite, MCP

---

### Task 1: Create Storybook Stories File

**Files:**
- Create: `packages/ui/src/components/timeline.stories.tsx`

- [ ] **Step 1: Create and write the storybook file**
Write the specified code into `packages/ui/src/components/timeline.stories.tsx`.

---

### Task 2: Build UI Package and Regenerate MCP Server Metadata

- [ ] **Step 1: Run build command**
Run: `npm run build`
Expected: Succeeds and outputs "TSX extraction and data generation completed successfully".

- [ ] **Step 2: Verify packages/mcp/data/components.json**
Verify that the `Timeline`, `TimelineItem`, `TimelineSeparator`, `TimelineConnector`, `TimelineDot`, `TimelineContent`, `TimelineTitle`, and `TimelineTime` components are listed/updated in `packages/mcp/data/components.json`.

---

### Task 3: Commit Story and MCP Data Changes

- [ ] **Step 1: Stage and commit the files**
Run: `git add packages/ui/src/components/timeline.stories.tsx packages/mcp/data/components.json`
Run: `git commit -m "feat(ui): add Storybook stories and regenerate MCP server metadata"`
Expected: Commit succeeds.
