#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(path.join(__dirname, ".."));
const AGENT_KIT_DIR = path.join(ROOT_DIR, "agent-kit");
const CONTENT_DIR = path.join(ROOT_DIR, "content", "docs");

const ROLES = ["contracts", "designer", "developer", "devops", "plugin"];

const AGENT_KIT_NOTE_SHORT = `> *Part of the [Agent Kit](/docs) — documentation written for AI agents, readable by humans.*`;

const AGENT_KIT_NOTE_FULL = `---

## About this document

This page is part of the **Jay Stack Agent Kit** — documentation generated from the framework source and written primarily for AI agents. The language and structure are optimized for machine consumption — expect precise, specification-style prose rather than narrative documentation. [Learn more about the Agent Kit &rarr;](/docs)`;

const colors = {
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  reset: "\x1b[0m",
};

function injectNotes(content) {
  const firstHeadingIndex = content.search(/^#\s+.+$/m);
  if (firstHeadingIndex === -1) {
    return content + "\n\n" + AGENT_KIT_NOTE_SHORT + "\n" + AGENT_KIT_NOTE_FULL + "\n";
  }
  const afterHeading = content.indexOf("\n", firstHeadingIndex);
  if (afterHeading === -1) {
    return content + "\n\n" + AGENT_KIT_NOTE_SHORT + "\n" + AGENT_KIT_NOTE_FULL + "\n";
  }
  const before = content.slice(0, afterHeading + 1);
  const after = content.slice(afterHeading + 1);
  return before + "\n" + AGENT_KIT_NOTE_SHORT + "\n" + after + "\n" + AGENT_KIT_NOTE_FULL + "\n";
}

function clearDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true });
  }
  fs.mkdirSync(dir, { recursive: true });
}

function main() {
  console.log(`${colors.yellow}Agent Kit Docs Sync${colors.reset}\n`);

  let totalFiles = 0;

  for (const role of ROLES) {
    const sourceDir = path.join(AGENT_KIT_DIR, role);
    const destDir = path.join(CONTENT_DIR, role);

    if (!fs.existsSync(sourceDir)) {
      console.log(`${colors.cyan}[${role}]${colors.reset} skipped (not found)`);
      continue;
    }

    clearDir(destDir);

    const files = fs.readdirSync(sourceDir).filter((f) => f.endsWith(".md"));
    let count = 0;

    for (const file of files) {
      const srcPath = path.join(sourceDir, file);
      if (!fs.statSync(srcPath).isFile()) continue;

      let content = fs.readFileSync(srcPath, "utf-8");
      content = injectNotes(content);
      fs.writeFileSync(path.join(destDir, file), content);
      count++;
    }

    console.log(`${colors.cyan}[${role}]${colors.reset} ${count} files`);
    totalFiles += count;
  }

  console.log(`\n${colors.green}Done:${colors.reset} ${totalFiles} files across ${ROLES.length} roles`);
}

main();
