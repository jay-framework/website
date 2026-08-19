#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(path.join(__dirname, ".."));
const AGENT_KIT_DIR = path.join(ROOT_DIR, "agent-kit");
const CONTENT_DIR = path.join(ROOT_DIR, "content", "docs");

const ROLES = ["contracts", "designer", "developer", "devops", "plugin"];
const SIDEBAR_ROLE_ORDER = ["designer", "developer", "plugin", "devops", "contracts"];
const SIDEBAR_DIR = path.join(ROOT_DIR, "src", "components", "docs-sidebar");

const ROLE_META = {
  contracts: {
    label: "Contracts",
    image: "https://static.wixstatic.com/media/c569b3_28d5b6b49bd14042b0eae9070028acf6~mv2.png/v1/fill/w_24,h_24/file.webp",
    entryFile: "GUIDE.md",
    entryTitle: "Guide",
  },
  designer: {
    label: "Designer",
    image: "https://static.wixstatic.com/media/c569b3_ebd9e460d96049b195b5ef0b340cffc8~mv2.png/v1/fill/w_24,h_24/file.webp",
    entryFile: "INSTRUCTIONS.md",
    entryTitle: "Instructions",
  },
  developer: {
    label: "Developer",
    image: "https://static.wixstatic.com/media/c569b3_838a1a4885714dae9579fe0b4d1a2293~mv2.png/v1/fill/w_24,h_24/file.webp",
    entryFile: "INSTRUCTIONS.md",
    entryTitle: "Instructions",
  },
  devops: {
    label: "DevOps",
    image: "https://static.wixstatic.com/media/c569b3_eaf3402bcc7c4fc784b5ae848a04af28~mv2.png/v1/fill/w_24,h_24/file.webp",
    entryFile: "INSTRUCTIONS.md",
    entryTitle: "Instructions",
  },
  plugin: {
    label: "Plugin Developer",
    image: "https://static.wixstatic.com/media/c569b3_e235dbf4943c4208aba88b4ed6ddd402~mv2.png/v1/fill/w_24,h_24/file.webp",
    entryFile: "INSTRUCTIONS.md",
    entryTitle: "Instructions",
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

function extractTitle(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const match = content.match(/^#\s+(.+)$/m);
  if (match) return match[1].trim();
  const name = path.basename(filePath, ".md");
  return name.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function fileToSlug(file) {
  return path.basename(file, ".md").toLowerCase();
}

function toEnumId(role, slug) {
  return `${role}_${slug}`.replace(/-/g, "_");
}

function collectSidebarData() {
  const roles = [];
  for (const role of SIDEBAR_ROLE_ORDER) {
    const contentDir = path.join(CONTENT_DIR, role);
    if (!fs.existsSync(contentDir)) continue;
    const meta = ROLE_META[role];
    const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".md"));
    const entrySlug = fileToSlug(meta.entryFile);
    const guides = [];
    for (const file of files) {
      const slug = fileToSlug(file);
      const isEntry = file.toUpperCase() === meta.entryFile.toUpperCase();
      const title = isEntry ? meta.entryTitle : extractTitle(path.join(contentDir, file));
      guides.push({ slug, title, href: `/docs/${role}/${slug}`, isEntry });
    }
    guides.sort((a, b) => {
      if (a.isEntry) return -1;
      if (b.isEntry) return 1;
      return a.title.localeCompare(b.title);
    });
    roles.push({ role, label: meta.label, image: meta.image, guides });
  }
  return roles;
}

function generateSidebarContract() {
  return `# GENERATED FILE — do not edit manually. Run: node scripts/sync-agent-kit-docs.cjs
name: docs-sidebar
description: Documentation sidebar navigation with collapsible role sections.
tags:
  - tag: currentPath
    type: data
    dataType: string
    phase: slow
  - tag: activePageTitle
    type: data
    dataType: string
    phase: slow
props:
  - name: currentPath
    kind: optional
  - name: activePageTitle
    kind: optional
`;
}

function generateSidebarTs() {
  return `// GENERATED FILE — do not edit manually. Run: node scripts/sync-agent-kit-docs.cjs
import { makeJayStackComponent, phaseOutput } from '@jay-framework/fullstack-component';
import type { DocsSidebarContract } from './docs-sidebar.jay-contract';

export const DocsSidebar = makeJayStackComponent<DocsSidebarContract>()
  .withProps<{ currentPath?: string; activePageTitle?: string }>()
  .withSlowlyRender(async (props: { currentPath?: string; activePageTitle?: string }) => {
    return phaseOutput({
      currentPath: props.currentPath ?? '',
      activePageTitle: props.activePageTitle ?? '',
    }, {});
  });
`;
}

function generateSidebarHtml(roles) {
  const roleBlocks = [];
  const mobileRoleBlocks = [];
  for (const r of roles) {
    const sectionPath = `/docs/${r.role}`;
    const guideItems = r.guides
      .map(
        (g) =>
          `          <li><a href="${g.href}" class="sidebar-link {currentPath === '${g.href}' ? active}">${escapeHtml(g.title)}</a></li>`
      )
      .join("\n");
    const block = `
      <details class="sidebar-role" open="currentPath ^= '${sectionPath}'">
        <summary class="sidebar-role-header">
          <img src="${r.image}" alt="" width="20" height="20" class="sidebar-role-icon">
          <span class="sidebar-role-label">${escapeHtml(r.label)}</span>
          <span class="sidebar-role-count">${r.guides.length}</span>
        </summary>
        <ul class="sidebar-guides">
${guideItems}
        </ul>
      </details>`;
    roleBlocks.push(block);
    mobileRoleBlocks.push(block);
  }

  const mobileSummaryLabels = roles
    .map(
      (r) =>
        `        <img if="currentPath ^= '/docs/${r.role}'" src="${r.image}" alt="" width="18" height="18" class="mobile-nav-icon">\n        <span if="currentPath ^= '/docs/${r.role}'" class="mobile-nav-label">${escapeHtml(r.label)}</span>`
    )
    .join("\n");

  // activePageTitle is passed as a prop and bound directly in the template

  return `<!-- GENERATED FILE — do not edit manually. Run: node scripts/sync-agent-kit-docs.cjs -->
<html>
<head>
  <script type="application/jay-data" contract="./docs-sidebar.jay-contract"></script>
  <style>
    .sidebar {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      width: 280px;
      background: var(--color-surface-lowest);
      border-right: 1px solid rgba(60, 73, 78, 0.2);
      overflow-y: auto;
      padding: 80px 0 32px; /* design-system: allow */
      z-index: 40;
      display: none;
    }
    @media (min-width: 1024px) {
      .sidebar { display: block; }
    }
    @media (min-width: 768px) and (max-width: 1023px) {
      .sidebar { display: block; width: 240px; }
    }

    .sidebar-home {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 0 24px 20px;
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--color-primary);
      text-decoration: none;
      border-bottom: 1px solid rgba(60, 73, 78, 0.2);
      margin-bottom: 16px;
    }
    .sidebar-home:hover { text-decoration: underline; }

    .sidebar-role { margin-bottom: 4px; }
    .sidebar-role-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 24px;
      cursor: pointer;
      list-style: none;
      user-select: none;
    }
    .sidebar-role-header::-webkit-details-marker { display: none; }
    .sidebar-role-header::marker { display: none; content: ''; }
    .sidebar-role-icon {
      width: 20px;
      height: 20px;
      object-fit: contain;
      flex-shrink: 0;
    }
    .sidebar-role-label {
      font-family: var(--font-display);
      font-size: 14px;
      font-weight: 600;
      color: var(--color-text);
      flex: 1;
    }
    .sidebar-role-count {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--color-text-muted);
      opacity: 0.6;
    }

    .sidebar-guides {
      list-style: none;
      padding: 0 0 8px;
      margin: 0;
    }
    .sidebar-link {
      display: block;
      padding: 5px 24px 5px 52px;
      font-family: var(--font-mono);
      font-size: 13px;
      line-height: 20px;
      color: var(--color-text-muted);
      text-decoration: none;
      border-left: 2px solid transparent;
      transition: color 0.15s, border-color 0.15s;
    }
    .sidebar-link:hover {
      color: var(--color-primary);
      text-decoration: none;
    }
    .sidebar-link.active {
      color: var(--color-primary);
      border-left-color: var(--color-primary);
      font-weight: 500;
    }

    /* ── Mobile navigation dropdown ── */
    .mobile-nav {
      display: none;
    }
    @media (max-width: 767px) {
      .mobile-nav {
        display: block;
        padding-top: 64px; /* design-system: allow — clears fixed header */
      }
    }
    .mobile-nav-toggle {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      cursor: pointer;
      list-style: none;
      user-select: none;
      background: var(--color-surface-lowest);
      border-bottom: 1px solid rgba(60, 73, 78, 0.2);
    }
    .mobile-nav-toggle::-webkit-details-marker { display: none; }
    .mobile-nav-toggle::marker { display: none; content: ''; }
    .mobile-nav-icon {
      width: 18px;
      height: 18px;
      object-fit: contain;
      flex-shrink: 0;
    }
    .mobile-nav-label {
      font-family: var(--font-display);
      font-size: 14px;
      font-weight: 600;
      color: var(--color-text);
    }
    .mobile-nav-page {
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--color-text-muted);
      font-weight: 400;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      min-width: 0;
    }
    .mobile-nav-page::before {
      content: '·';
      margin: 0 6px;
    }
    .mobile-nav-chevron {
      margin-left: auto;
      width: 16px;
      height: 16px;
      color: var(--color-text-muted);
      transition: transform 0.2s;
      flex-shrink: 0;
    }
    .mobile-nav[open] .mobile-nav-chevron {
      transform: rotate(180deg);
    }
    .mobile-nav-panel {
      max-height: 60vh;
      overflow-y: auto;
      background: var(--color-surface-lowest);
      border-bottom: 1px solid rgba(60, 73, 78, 0.2);
      padding-bottom: 12px;
    }
    .mobile-nav-panel .sidebar-home {
      padding: 12px 16px;
      margin-bottom: 8px;
      border-bottom: 1px solid rgba(60, 73, 78, 0.15);
    }
    .mobile-nav-panel .sidebar-role-header {
      padding: 8px 16px;
    }
    .mobile-nav-panel .sidebar-link {
      padding: 5px 16px 5px 44px;
    }
  </style>
</head>
<body>
  <div>
    <details class="mobile-nav">
      <summary class="mobile-nav-toggle">
${mobileSummaryLabels}
        <span class="mobile-nav-page">{activePageTitle}</span>
        <svg class="mobile-nav-chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </summary>
      <div class="mobile-nav-panel">
        <a href="/docs" class="sidebar-home">&larr; Documentation</a>
${mobileRoleBlocks.join("\n")}
      </div>
    </details>
    <aside class="sidebar">
      <nav>
        <a href="/docs" class="sidebar-home">&larr; Documentation</a>
${roleBlocks.join("\n")}
      </nav>
    </aside>
  </div>
</body>
</html>
`;
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function generateSidebarComponent() {
  const roles = collectSidebarData();
  const totalGuides = roles.reduce((sum, r) => sum + r.guides.length, 0);
  fs.mkdirSync(SIDEBAR_DIR, { recursive: true });
  fs.writeFileSync(path.join(SIDEBAR_DIR, "docs-sidebar.jay-contract"), generateSidebarContract());
  fs.writeFileSync(path.join(SIDEBAR_DIR, "docs-sidebar.ts"), generateSidebarTs());
  fs.writeFileSync(path.join(SIDEBAR_DIR, "docs-sidebar.jay-html"), generateSidebarHtml(roles));
  console.log(`\n${colors.cyan}[sidebar]${colors.reset} generated component (${totalGuides} pages across ${roles.length} roles)`);
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
      fs.writeFileSync(path.join(destDir, file.toLowerCase()), content);
      count++;
    }

    console.log(`${colors.cyan}[${role}]${colors.reset} ${count} files`);
    totalFiles += count;
  }

  console.log(`\n${colors.green}Done:${colors.reset} ${totalFiles} files across ${ROLES.length} roles`);

  generateSidebarComponent();
}

main();
