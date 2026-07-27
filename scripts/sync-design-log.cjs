#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const os = require("os");

const SCRIPT_DIR = __dirname;
const ROOT_DIR = path.resolve(path.join(SCRIPT_DIR, ".."));
const CONTENT_DIR = path.join(ROOT_DIR, "src", "pages", "design-log", "content");
const SYNC_HASH_FILE = path.join(CONTENT_DIR, ".sync-hash");
const REPO_URL = "git@github.com:jay-framework/jay.git";
const BRANCH = "main";

const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  reset: "\x1b[0m",
};

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`${colors.yellow}Design Log Sync Script${colors.reset}`);
  console.log("");
  console.log("Syncs the design-log folder from the jay repo into");
  console.log("src/pages/design-log/content/ for page generation.");
  console.log("");
  console.log("Usage:");
  console.log("  node sync-design-log.cjs [--force]");
  console.log("");
  console.log("Options:");
  console.log("  --force  Re-sync even if the commit hash hasn't changed");
  process.exit(0);
}

const forceSync = process.argv.includes("--force");

function getRemoteHash() {
  const output = execSync(`git ls-remote ${REPO_URL} refs/heads/${BRANCH}`, {
    encoding: "utf-8",
    timeout: 15000,
  });
  const hash = output.split(/\s/)[0];
  if (!hash) {
    throw new Error("Could not resolve remote HEAD");
  }
  return hash;
}

function getStoredHash() {
  try {
    return fs.readFileSync(SYNC_HASH_FILE, "utf-8").trim();
  } catch {
    return null;
  }
}

function normalizeFilename(name) {
  return name
    .replace(/\.md$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    + ".md";
}

function titleCase(str) {
  return str.replace(
    /\b\w+/g,
    (w) => w[0].toUpperCase() + w.slice(1)
  );
}

function parseTitleFromFilename(name) {
  const base = name.replace(/\.md$/, "");
  const match = base.match(/^(\d+)\s*-\s*(.+)$/);
  if (match) {
    return { number: parseInt(match[1], 10), title: titleCase(match[2].trim()) };
  }
  return { number: null, title: titleCase(base.trim()) };
}

function addFrontmatter(content, filename) {
  if (content.trimStart().startsWith("---")) {
    return content;
  }
  const { number, title } = parseTitleFromFilename(filename);
  const lines = [`---`];
  lines.push(`title: "${title.replace(/"/g, '\\"')}"`);
  if (number !== null) {
    lines.push(`number: ${number}`);
  }
  lines.push(`---`, "", content);
  return lines.join("\n");
}

function clearContentDir() {
  if (fs.existsSync(CONTENT_DIR)) {
    fs.rmSync(CONTENT_DIR, { recursive: true });
  }
  fs.mkdirSync(CONTENT_DIR, { recursive: true });
}

function main() {
  console.log(`${colors.yellow}Design Log Sync${colors.reset}`);
  console.log(`Repo: ${REPO_URL}`);
  console.log("");

  const remoteHash = getRemoteHash();
  const storedHash = getStoredHash();

  if (!forceSync && remoteHash === storedHash) {
    console.log(`${colors.green}Already up to date${colors.reset} (${remoteHash.slice(0, 8)})`);
    process.exit(0);
  }

  console.log(`Remote: ${remoteHash.slice(0, 8)}${storedHash ? `, local: ${storedHash.slice(0, 8)}` : " (no local hash)"}`);
  console.log("Cloning design-log folder...");

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "jay-design-log-"));

  try {
    execSync(
      `git clone --depth 1 --filter=blob:none --sparse "${REPO_URL}" "${tmpDir}"`,
      { stdio: "pipe", timeout: 60000 }
    );
    execSync("git sparse-checkout set design-log", {
      cwd: tmpDir,
      stdio: "pipe",
      timeout: 15000,
    });

    const sourceDir = path.join(tmpDir, "design-log");
    if (!fs.existsSync(sourceDir)) {
      console.log(`${colors.red}Error: design-log folder not found in repo${colors.reset}`);
      process.exit(1);
    }

    clearContentDir();

    const entries = fs.readdirSync(sourceDir);
    let mdCount = 0;
    let imgCount = 0;

    for (const entry of entries) {
      const srcPath = path.join(sourceDir, entry);
      if (!fs.statSync(srcPath).isFile()) continue;

      if (entry.endsWith(".md")) {
        const content = fs.readFileSync(srcPath, "utf-8");
        const processed = addFrontmatter(content, entry);
        const normalName = normalizeFilename(entry);
        fs.writeFileSync(path.join(CONTENT_DIR, normalName), processed);
        mdCount++;
      } else if (/\.(png|jpg|jpeg|gif|svg|webp)$/i.test(entry)) {
        const normalName = entry.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-|-$/g, "");
        fs.copyFileSync(srcPath, path.join(CONTENT_DIR, normalName));
        imgCount++;
      }
    }

    fs.writeFileSync(SYNC_HASH_FILE, remoteHash + "\n");

    console.log("");
    console.log(`${colors.green}Done:${colors.reset} ${mdCount} markdown files, ${imgCount} images`);
    console.log(`Content dir: ${path.relative(ROOT_DIR, CONTENT_DIR)}`);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

main();
