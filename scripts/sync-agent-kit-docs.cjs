#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(path.join(__dirname, ".."));
const AGENT_KIT_DIR = path.join(ROOT_DIR, "agent-kit");
const CONTENT_DIR = path.join(ROOT_DIR, "content", "docs");

const ROLES = ["contracts", "designer", "developer", "devops", "plugin"];

const ROLE_META = {
  contracts: {
    label: "Contracts",
    image: "https://static.wixstatic.com/media/c569b3_28d5b6b49bd14042b0eae9070028acf6~mv2.png/v1/fill/w_24,h_24/file.webp",
  },
  designer: {
    label: "Designer",
    image: "https://static.wixstatic.com/media/c569b3_ebd9e460d96049b195b5ef0b340cffc8~mv2.png/v1/fill/w_24,h_24/file.webp",
  },
  developer: {
    label: "Developer",
    image: "https://static.wixstatic.com/media/c569b3_838a1a4885714dae9579fe0b4d1a2293~mv2.png/v1/fill/w_24,h_24/file.webp",
  },
  devops: {
    label: "DevOps",
    image: "https://static.wixstatic.com/media/c569b3_eaf3402bcc7c4fc784b5ae848a04af28~mv2.png/v1/fill/w_24,h_24/file.webp",
  },
  plugin: {
    label: "Plugin Developer",
    image: "https://static.wixstatic.com/media/c569b3_e235dbf4943c4208aba88b4ed6ddd402~mv2.png/v1/fill/w_24,h_24/file.webp",
  },
};

function makeShortNote(role) {
  const meta = ROLE_META[role];
  return `> <img src="${meta.image}" alt="${meta.label}" width="24" height="24" style="display:inline;vertical-align:middle;margin-right:6px;">*${meta.label} Agent Kit — [documentation written for AI agents, readable by humans](/docs).*`;
}

const AGENT_KIT_NOTE_FULL = `---

## About this document

This page is part of the **Jay Stack Agent Kit** — documentation generated from the framework source and written primarily for AI agents. The language and structure are optimized for machine consumption — expect precise, specification-style prose rather than narrative documentation. [Learn more about the Agent Kit &rarr;](/docs)`;

const colors = {
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  reset: "\x1b[0m",
};

function injectNotes(content, role) {
  const shortNote = makeShortNote(role);
  const firstHeadingIndex = content.search(/^#\s+.+$/m);
  if (firstHeadingIndex === -1) {
    return content + "\n\n" + shortNote + "\n" + AGENT_KIT_NOTE_FULL + "\n";
  }
  const afterHeading = content.indexOf("\n", firstHeadingIndex);
  if (afterHeading === -1) {
    return content + "\n\n" + shortNote + "\n" + AGENT_KIT_NOTE_FULL + "\n";
  }
  const before = content.slice(0, afterHeading + 1);
  const after = content.slice(afterHeading + 1);
  return before + "\n" + shortNote + "\n" + after + "\n" + AGENT_KIT_NOTE_FULL + "\n";
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
      content = injectNotes(content, role);
      fs.writeFileSync(path.join(destDir, file), content);
      count++;
    }

    console.log(`${colors.cyan}[${role}]${colors.reset} ${count} files`);
    totalFiles += count;
  }

  console.log(`\n${colors.green}Done:${colors.reset} ${totalFiles} files across ${ROLES.length} roles`);
}

main();
