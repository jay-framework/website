#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const os = require("os");

const SCRIPT_DIR = __dirname;
const ROOT_DIR = path.resolve(path.join(SCRIPT_DIR, ".."));
const CONTENT_DIR = path.join(ROOT_DIR, "content", "design-log");
const PUBLIC_DIR = path.join(ROOT_DIR, "public", "design-log");
const MEDIA_MAP_FILE = path.join(ROOT_DIR, "config", ".design-log-media-map.yaml");
const MEDIA_CONFIG_FILE = path.join(ROOT_DIR, "config", ".design-log-media.json");
const SYNC_HASH_FILE = path.join(CONTENT_DIR, ".sync-hash");
const MEDIA_INDEX_FILE = path.join(ROOT_DIR, "agent-kit", "references", "wix-media", "MEDIA-INDEX.md");
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
  console.log("Syncs the design-log folder from the jay repo, uploads images");
  console.log("to Wix Media, and generates the media map — all in one call.");
  console.log("");
  console.log("Usage:");
  console.log("  node sync-design-log.cjs [--force]");
  console.log("");
  console.log("Options:");
  console.log("  --force  Re-sync even if the commit hash hasn't changed");
  process.exit(0);
}

const forceSync = process.argv.includes("--force");

// ── Filename normalization ──

function normalizeSlug(name) {
  return name
    .replace(/\.md$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeFilename(name) {
  return normalizeSlug(name) + ".md";
}

function normalizeImageFilename(name) {
  const ext = path.extname(name);
  const base = name.slice(0, -ext.length);
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    + ext.toLowerCase();
}

// ── Link rewriting ──

function buildLinkMap(mdFiles, imageFiles) {
  const map = {};

  for (const original of mdFiles) {
    const slug = normalizeSlug(original);
    const base = original.replace(/\.md$/, "");
    // All forms a link might use to reference this file
    const variants = new Set([
      base,                              // "01 - what is Jay"
      `./${base}`,                       // "./01 - what is Jay"
      original,                          // "01 - what is Jay.md"
      `./${original}`,                   // "./01 - what is Jay.md"
      encodeURIComponent(base),          // full encoding (rare)
      base.replace(/ /g, "%20"),         // space-only encoding
      `./${base.replace(/ /g, "%20")}`,  // with prefix
      original.replace(/ /g, "%20"),
      `./${original.replace(/ /g, "%20")}`,
    ]);
    for (const v of variants) {
      map[v] = slug;
    }
  }

  for (const original of imageFiles) {
    const normalized = normalizeImageFilename(original);
    const variants = new Set([
      original,
      `./${original}`,
      original.replace(/ /g, "%20"),
      `./${original.replace(/ /g, "%20")}`,
    ]);
    for (const v of variants) {
      map[v] = normalized;
    }
  }

  return map;
}

function rewriteLinks(content, linkMap) {
  // Match markdown links: [text](target) and [text](target 'title')
  // Also matches image links: ![alt](target) and ![alt](target 'title')
  return content.replace(
    /(!?\[[^\]]*\])\(([^)]+)\)/g,
    (match, bracket, inside) => {
      // Separate target from optional title: "target 'title'" or "target"
      const titleMatch = inside.match(/^(.+?)\s+(['"])(.+?)\2$/);
      const target = titleMatch ? titleMatch[1] : inside.trim();
      const title = titleMatch ? ` ${titleMatch[2]}${titleMatch[3]}${titleMatch[2]}` : "";

      if (target.startsWith("http") || target.startsWith("#") || target.startsWith("..")) {
        return match;
      }

      const replacement = linkMap[target];
      if (replacement) {
        return `${bracket}(${replacement}${title})`;
      }
      return match;
    }
  );
}

// ── Frontmatter ──

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

// ── Media config & map ──

function loadMediaConfig() {
  try {
    return JSON.parse(fs.readFileSync(MEDIA_CONFIG_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function saveMediaConfig(config) {
  fs.writeFileSync(MEDIA_CONFIG_FILE, JSON.stringify(config, null, 2) + "\n");
}

function parseMediaIndex() {
  if (!fs.existsSync(MEDIA_INDEX_FILE)) return {};
  const content = fs.readFileSync(MEDIA_INDEX_FILE, "utf-8");
  const lines = content.split("\n").filter((l) => l.startsWith("| ") && !l.startsWith("| Folder") && !l.startsWith("| ---"));
  const urlByDisplayName = {};
  for (const line of lines) {
    const cols = line.split("|").map((c) => c.trim()).filter(Boolean);
    if (cols.length >= 7) {
      const displayName = cols[2];
      const url = cols[6];
      if (url.startsWith("http")) {
        urlByDisplayName[displayName] = url;
      }
    }
  }
  return urlByDisplayName;
}

function generateMediaMap(mediaConfig) {
  const cdnUrls = parseMediaIndex();

  const yamlLines = ["# Auto-generated by sync-design-log.cjs"];
  let mapped = 0;
  let local = 0;

  for (const [original, info] of Object.entries(mediaConfig)) {
    const cdnUrl = cdnUrls[info.normalized];
    const src = cdnUrl || info.normalized;
    yamlLines.push(`"${original}":`);
    yamlLines.push(`  src: "${src}"`);
    if (cdnUrl) mapped++;
    else local++;
  }

  fs.mkdirSync(path.dirname(MEDIA_MAP_FILE), { recursive: true });
  fs.writeFileSync(MEDIA_MAP_FILE, yamlLines.join("\n") + "\n");
  console.log(`Media map: ${mapped} CDN, ${local} local fallback`);
}

// ── Wix Media upload ──

function uploadAndRebuildIndex() {
  console.log("\nUploading images to Wix Media...");
  try {
    execSync("jay-stack-cli run wix-media/upload-public --folder design-log", {
      cwd: ROOT_DIR,
      stdio: "inherit",
      timeout: 120000,
    });
  } catch (e) {
    console.log(`${colors.yellow}Upload failed or partially completed — media map will use local fallback${colors.reset}`);
    return false;
  }

  console.log("\nRebuilding media index...");
  try {
    execSync("jay-stack-cli run wix-media/rebuild-index", {
      cwd: ROOT_DIR,
      stdio: "inherit",
      timeout: 60000,
    });
  } catch (e) {
    console.log(`${colors.yellow}Rebuild-index failed — media map will use local fallback${colors.reset}`);
    return false;
  }

  return true;
}

// ── Helpers ──

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

function clearDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true });
  }
  fs.mkdirSync(dir, { recursive: true });
}

// ── Main ──

function main() {
  console.log(`${colors.yellow}Design Log Sync${colors.reset}`);
  console.log(`Repo: ${REPO_URL}\n`);

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

    clearDir(CONTENT_DIR);
    clearDir(PUBLIC_DIR);

    // First pass: collect all filenames for link rewriting
    const entries = fs.readdirSync(sourceDir);
    const mdFiles = [];
    const imageFiles = [];

    for (const entry of entries) {
      const srcPath = path.join(sourceDir, entry);
      if (!fs.statSync(srcPath).isFile()) continue;
      if (entry.endsWith(".md")) mdFiles.push(entry);
      else if (/\.(png|jpg|jpeg|gif|svg|webp)$/i.test(entry)) imageFiles.push(entry);
    }

    const linkMap = buildLinkMap(mdFiles, imageFiles);

    // Second pass: process files with link rewriting
    let mdCount = 0;
    let imgCount = 0;
    const newMediaConfig = {};

    for (const entry of mdFiles) {
      const srcPath = path.join(sourceDir, entry);
      let content = fs.readFileSync(srcPath, "utf-8");
      content = rewriteLinks(content, linkMap);
      content = addFrontmatter(content, entry);
      const normalName = normalizeFilename(entry);
      fs.writeFileSync(path.join(CONTENT_DIR, normalName), content);
      mdCount++;
    }

    for (const entry of imageFiles) {
      const srcPath = path.join(sourceDir, entry);
      const normalName = normalizeImageFilename(entry);
      fs.copyFileSync(srcPath, path.join(PUBLIC_DIR, normalName));
      newMediaConfig[entry] = { normalized: normalName };
      imgCount++;
    }

    const oldMediaConfig = loadMediaConfig();
    const imagesChanged =
      JSON.stringify(Object.keys(newMediaConfig).sort()) !==
      JSON.stringify(Object.keys(oldMediaConfig).sort());

    saveMediaConfig(newMediaConfig);
    fs.writeFileSync(SYNC_HASH_FILE, remoteHash + "\n");

    console.log(`\n${colors.green}Synced:${colors.reset} ${mdCount} markdown files, ${imgCount} images`);
    console.log(`Markdown: ${path.relative(ROOT_DIR, CONTENT_DIR)}`);
    console.log(`Images:   ${path.relative(ROOT_DIR, PUBLIC_DIR)}`);

    if (imagesChanged) {
      uploadAndRebuildIndex();
    } else {
      console.log("\nImages unchanged — skipping upload");
    }

    console.log("");
    generateMediaMap(newMediaConfig);

    console.log(`\n${colors.green}Done${colors.reset}`);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

main();
