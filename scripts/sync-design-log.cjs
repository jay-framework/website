#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const os = require("os");
const { loadCache, resolveSeo } = require("./seo-meta.cjs");

const SEO_CACHE = loadCache();

const SCRIPT_DIR = __dirname;
const ROOT_DIR = path.resolve(path.join(SCRIPT_DIR, ".."));
const MEDIA_INDEX_FILE = path.join(
  ROOT_DIR,
  "agent-kit",
  "references",
  "wix-media",
  "MEDIA-INDEX.md",
);

const REPOS = [
  {
    name: "jay",
    url: "git@github.com:jay-framework/jay.git",
    folder: "design-log",
  },
  {
    name: "wix",
    url: "git@github.com:jay-framework/wix.git",
    folder: "design-log",
  },
];

const LOCAL_SOURCES = [{ name: "website", folder: "design-log" }];

const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  reset: "\x1b[0m",
};

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`${colors.yellow}Design Log Sync Script${colors.reset}`);
  console.log("");
  console.log(
    "Syncs design-log folders from jay and wix repos, uploads images",
  );
  console.log("to Wix Media, and generates media maps — all in one call.");
  console.log("");
  console.log("Usage:");
  console.log("  node sync-design-log.cjs [--force]");
  console.log("");
  console.log("Options:");
  console.log("  --force  Re-sync even if the commit hash hasn't changed");
  process.exit(0);
}

const forceSync = process.argv.includes("--force");

// ── Repo paths ──

function repoPaths(name) {
  return {
    contentDir: path.join(ROOT_DIR, "content", "design-log", name),
    publicDir: path.join(ROOT_DIR, "public", "design-log", name),
    mediaMapFile: path.join(
      ROOT_DIR,
      "config",
      `.design-log-media-map-${name}.yaml`,
    ),
    mediaConfigFile: path.join(
      ROOT_DIR,
      "config",
      `.design-log-media-${name}.json`,
    ),
    syncHashFile: path.join(
      ROOT_DIR,
      "content",
      "design-log",
      name,
      ".sync-hash",
    ),
  };
}

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
  return (
    base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") + ext.toLowerCase()
  );
}

// ── Link rewriting ──

function buildLinkMap(mdFiles, imageFiles) {
  const map = {};

  for (const original of mdFiles) {
    const slug = normalizeSlug(original);
    const base = original.replace(/\.md$/, "");
    const variants = new Set([
      base,
      `./${base}`,
      original,
      `./${original}`,
      encodeURIComponent(base),
      base.replace(/ /g, "%20"),
      `./${base.replace(/ /g, "%20")}`,
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

function buildSlugSet(mdFiles) {
  return new Set(mdFiles.map(normalizeSlug));
}

function rewriteLinks(content, linkMap, slugSet) {
  return content.replace(
    /(!?\[[^\]]*\])\(([^)]+)\)/g,
    (match, bracket, inside) => {
      const titleMatch = inside.match(/^(.+?)\s+(['"])(.+?)\2$/);
      let target = titleMatch ? titleMatch[1] : inside.trim();
      const title = titleMatch
        ? ` ${titleMatch[2]}${titleMatch[3]}${titleMatch[2]}`
        : "";

      // Markdown allows wrapping a destination with spaces in <angle brackets>.
      if (target.startsWith("<") && target.endsWith(">")) {
        target = target.slice(1, -1);
      }

      if (
        target.startsWith("http") ||
        target.startsWith("#") ||
        target.startsWith("mailto:")
      ) {
        return match;
      }

      // Fast path: exact variant match (covers images and simple sibling links).
      if (!target.startsWith("..")) {
        const replacement = linkMap[target];
        if (replacement) {
          return `${bracket}(${replacement}${title})`;
        }
      }

      // Robust fallback: a cross-reference to another design-log entry may carry
      // %20/%28 encodings, an <angle-bracket> wrapper, or a duplicated
      // "design-log/" prefix. Decode, take the basename, and map it to the entry
      // slug — but only if that slug is a real file in this section, so we never
      // invent a target or touch genuine cross-repo / source-file links.
      const hashIdx = target.indexOf("#");
      const frag = hashIdx >= 0 ? target.slice(hashIdx) : "";
      const pathPart = hashIdx >= 0 ? target.slice(0, hashIdx) : target;
      let decoded;
      try {
        decoded = decodeURIComponent(pathPart);
      } catch {
        decoded = pathPart;
      }
      const basename = decoded.replace(/^.*\//, "");
      const slug = normalizeSlug(basename);
      if (slug && slugSet.has(slug)) {
        return `${bracket}(${slug}${frag}${title})`;
      }
      return match;
    },
  );
}

// ── Frontmatter ──

function titleCase(str) {
  return str.replace(/\b\w+/g, (w) => w[0].toUpperCase() + w.slice(1));
}

function parseTitleFromFilename(name) {
  const base = name.replace(/\.md$/, "");
  const match = base.match(/^(\d+)\s*-\s*(.+)$/);
  if (match) {
    return {
      number: parseInt(match[1], 10),
      title: titleCase(match[2].trim()),
    };
  }
  return { number: null, title: titleCase(base.trim()) };
}

const AGENT_NOTE_SHORT = `> *Written for AI agents. See [Log Methodology Note](#log-methodology-note) below for details.*`;

const AGENT_NOTE_FULL = `---

## Log Methodology Note

**Note:** These design logs are written primarily for AI agents as part of the [Design Log methodology](/design-log) and made accessible here for human readers. The language and structure are optimized for machine consumption — expect precise, specification-style prose rather than narrative documentation.`;

function escapeYaml(s) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

// Rebuild the frontmatter with a budgeted title + a description, preserving an
// existing title/number (from source frontmatter) and any other custom fields.
// Handles both bare markdown and files that already ship with frontmatter.
function addFrontmatter(content, filename, section) {
  const parsed = parseTitleFromFilename(filename);
  const key = `design-log/${section}/${normalizeSlug(filename)}`;

  const fm = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const block = fm ? fm[1] : "";
  const body = (fm ? content.slice(fm[0].length) : content).replace(/^\s+/, "");

  const existingTitle = (block.match(/^title:\s*"?(.*?)"?\s*$/m) || [])[1];
  const numMatch = block.match(/^number:\s*(\d+)\s*$/m);
  const number = numMatch ? parseInt(numMatch[1], 10) : parsed.number;
  // Any frontmatter lines we don't manage ourselves, preserved verbatim.
  const extras = block
    .split(/\r?\n/)
    .filter((l) => l.trim() && !/^\s*(title|description|number)\s*:/.test(l));

  const seo = resolveSeo({
    cache: SEO_CACHE,
    key,
    markdown: body,
    rawTitle: existingTitle || parsed.title,
  });

  const lines = [`---`];
  lines.push(`title: "${escapeYaml(seo.title)}"`);
  lines.push(`description: "${escapeYaml(seo.description)}"`);
  if (number !== null) {
    lines.push(`number: ${number}`);
  }
  lines.push(...extras);
  lines.push(`---`, "", body);
  return lines.join("\n");
}

function injectNotes(content) {
  const firstHeadingIndex = content.search(/^#\s+.+$/m);
  if (firstHeadingIndex === -1) {
    return content + "\n\n" + AGENT_NOTE_SHORT + "\n" + AGENT_NOTE_FULL + "\n";
  }
  const afterHeading = content.indexOf("\n", firstHeadingIndex);
  if (afterHeading === -1) {
    return content + "\n\n" + AGENT_NOTE_SHORT + "\n" + AGENT_NOTE_FULL + "\n";
  }
  const before = content.slice(0, afterHeading + 1);
  const after = content.slice(afterHeading + 1);
  return (
    before +
    "\n" +
    AGENT_NOTE_SHORT +
    "\n" +
    after +
    "\n" +
    AGENT_NOTE_FULL +
    "\n"
  );
}

// ── Media config & map ──

function loadMediaConfig(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return {};
  }
}

function saveMediaConfig(filePath, config) {
  fs.writeFileSync(filePath, JSON.stringify(config, null, 2) + "\n");
}

function parseMediaIndex() {
  if (!fs.existsSync(MEDIA_INDEX_FILE)) return {};
  const content = fs.readFileSync(MEDIA_INDEX_FILE, "utf-8");
  const lines = content
    .split("\n")
    .filter(
      (l) =>
        l.startsWith("| ") &&
        !l.startsWith("| Folder") &&
        !l.startsWith("| ---"),
    );
  const urlByDisplayName = {};
  for (const line of lines) {
    const cols = line
      .split("|")
      .map((c) => c.trim())
      .filter(Boolean);
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

function generateMediaMap(mediaMapFile, mediaConfig) {
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

  fs.mkdirSync(path.dirname(mediaMapFile), { recursive: true });
  fs.writeFileSync(mediaMapFile, yamlLines.join("\n") + "\n");
  console.log(`  Media map: ${mapped} CDN, ${local} local fallback`);
}

// ── Wix Media upload ──

function uploadAndRebuildIndex(repoName) {
  console.log("\n  Uploading images to Wix Media...");
  try {
    execSync(
      `jay-stack-cli run wix-media/upload-public --folder design-log/${repoName}`,
      {
        cwd: ROOT_DIR,
        stdio: "inherit",
        timeout: 120000,
      },
    );
  } catch (e) {
    console.log(
      `  ${colors.yellow}Upload failed — media map will use local fallback${colors.reset}`,
    );
    return false;
  }

  console.log("\n  Rebuilding media index...");
  try {
    execSync("jay-stack-cli run wix-media/rebuild-index", {
      cwd: ROOT_DIR,
      stdio: "inherit",
      timeout: 60000,
    });
  } catch (e) {
    console.log(
      `  ${colors.yellow}Rebuild-index failed — media map will use local fallback${colors.reset}`,
    );
    return false;
  }

  return true;
}

// ── Helpers ──

function getRemoteHash(repoUrl, branch) {
  const output = execSync(`git ls-remote ${repoUrl} refs/heads/${branch}`, {
    encoding: "utf-8",
    timeout: 15000,
  });
  const hash = output.split(/\s/)[0];
  if (!hash) {
    throw new Error(`Could not resolve HEAD for ${repoUrl}`);
  }
  return hash;
}

function getStoredHash(hashFile) {
  try {
    return fs.readFileSync(hashFile, "utf-8").trim();
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

// ── Sync one repo ──

function syncRepo(repo) {
  const { name, url, folder } = repo;
  const paths = repoPaths(name);
  const branch = "main";

  console.log(`\n${colors.cyan}[${name}]${colors.reset} ${url}`);

  const remoteHash = getRemoteHash(url, branch);
  const storedHash = getStoredHash(paths.syncHashFile);

  if (!forceSync && remoteHash === storedHash) {
    console.log(
      `  ${colors.green}Already up to date${colors.reset} (${remoteHash.slice(0, 8)})`,
    );
    return;
  }

  console.log(
    `  Remote: ${remoteHash.slice(0, 8)}${storedHash ? `, local: ${storedHash.slice(0, 8)}` : " (no local hash)"}`,
  );
  console.log("  Cloning...");

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `jay-dl-${name}-`));

  try {
    execSync(
      `git clone --depth 1 --filter=blob:none --sparse "${url}" "${tmpDir}"`,
      { stdio: "pipe", timeout: 60000 },
    );
    execSync(`git sparse-checkout set ${folder}`, {
      cwd: tmpDir,
      stdio: "pipe",
      timeout: 15000,
    });

    const sourceDir = path.join(tmpDir, folder);
    if (!fs.existsSync(sourceDir)) {
      console.log(
        `  ${colors.red}Error: ${folder}/ not found in repo${colors.reset}`,
      );
      return;
    }

    clearDir(paths.contentDir);
    clearDir(paths.publicDir);

    // First pass: collect filenames
    const entries = fs.readdirSync(sourceDir);
    const mdFiles = [];
    const imageFiles = [];

    for (const entry of entries) {
      const srcPath = path.join(sourceDir, entry);
      if (!fs.statSync(srcPath).isFile()) continue;
      if (entry.endsWith(".md")) mdFiles.push(entry);
      else if (/\.(png|jpg|jpeg|gif|svg|webp)$/i.test(entry))
        imageFiles.push(entry);
    }

    const linkMap = buildLinkMap(mdFiles, imageFiles);
    const slugSet = buildSlugSet(mdFiles);

    // Second pass: process files
    let mdCount = 0;
    let imgCount = 0;
    const newMediaConfig = {};

    for (const entry of mdFiles) {
      const srcPath = path.join(sourceDir, entry);
      let content = fs.readFileSync(srcPath, "utf-8");
      content = rewriteLinks(content, linkMap, slugSet);
      content = injectNotes(content);
      content = addFrontmatter(content, entry, name);
      const normalName = normalizeFilename(entry);
      fs.writeFileSync(path.join(paths.contentDir, normalName), content);
      mdCount++;
    }

    for (const entry of imageFiles) {
      const srcPath = path.join(sourceDir, entry);
      const normalName = normalizeImageFilename(entry);
      fs.copyFileSync(srcPath, path.join(paths.publicDir, normalName));
      newMediaConfig[entry] = { normalized: normalName };
      imgCount++;
    }

    const oldMediaConfig = loadMediaConfig(paths.mediaConfigFile);
    const imagesChanged =
      JSON.stringify(Object.keys(newMediaConfig).sort()) !==
      JSON.stringify(Object.keys(oldMediaConfig).sort());

    saveMediaConfig(paths.mediaConfigFile, newMediaConfig);
    fs.writeFileSync(paths.syncHashFile, remoteHash + "\n");

    console.log(
      `  ${colors.green}Synced:${colors.reset} ${mdCount} markdown files, ${imgCount} images`,
    );

    if (imgCount > 0) {
      if (imagesChanged) {
        uploadAndRebuildIndex(name);
      } else {
        console.log("  Images unchanged — skipping upload");
      }
      generateMediaMap(paths.mediaMapFile, newMediaConfig);
    }
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

// ── Sync local source (no git clone) ──

function syncLocal(source) {
  const { name, folder } = source;
  const paths = repoPaths(name);
  const sourceDir = path.join(ROOT_DIR, folder);

  console.log(`\n${colors.cyan}[${name}]${colors.reset} local: ${folder}/`);

  if (!fs.existsSync(sourceDir)) {
    console.log(`  ${colors.red}Error: ${folder}/ not found${colors.reset}`);
    return;
  }

  clearDir(paths.contentDir);

  const entries = fs.readdirSync(sourceDir);
  const mdFiles = [];
  const imageFiles = [];

  for (const entry of entries) {
    const srcPath = path.join(sourceDir, entry);
    if (!fs.statSync(srcPath).isFile()) continue;
    if (entry.endsWith(".md")) mdFiles.push(entry);
    else if (/\.(png|jpg|jpeg|gif|svg|webp)$/i.test(entry))
      imageFiles.push(entry);
  }

  const linkMap = buildLinkMap(mdFiles, imageFiles);
  const slugSet = buildSlugSet(mdFiles);

  let mdCount = 0;
  let imgCount = 0;

  for (const entry of mdFiles) {
    const srcPath = path.join(sourceDir, entry);
    let content = fs.readFileSync(srcPath, "utf-8");
    content = rewriteLinks(content, linkMap, slugSet);
    content = injectNotes(content);
    content = addFrontmatter(content, entry, name);
    const normalName = normalizeFilename(entry);
    fs.writeFileSync(path.join(paths.contentDir, normalName), content);
    mdCount++;
  }

  if (imageFiles.length > 0) {
    fs.mkdirSync(paths.publicDir, { recursive: true });
    for (const entry of imageFiles) {
      const srcPath = path.join(sourceDir, entry);
      const normalName = normalizeImageFilename(entry);
      fs.copyFileSync(srcPath, path.join(paths.publicDir, normalName));
      imgCount++;
    }
  }

  console.log(
    `  ${colors.green}Synced:${colors.reset} ${mdCount} markdown files, ${imgCount} images`,
  );
}

// ── Main ──

function main() {
  console.log(`${colors.yellow}Design Log Sync${colors.reset}`);

  for (const repo of REPOS) {
    syncRepo(repo);
  }

  for (const source of LOCAL_SOURCES) {
    syncLocal(source);
  }

  console.log(`\n${colors.green}Done${colors.reset}`);
}

if (require.main === module) {
  main();
}

module.exports = { normalizeSlug, buildLinkMap, buildSlugSet, rewriteLinks };
