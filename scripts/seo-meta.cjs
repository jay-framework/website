// ── Shared SEO meta helpers ──
//
// Markdown-synced pages (design-log, docs) get their `<title>` and
// `<meta name="description">` from frontmatter via @jay-framework/markdown.
// Source markdown mostly lacks `description` and has long titles, which fails
// the `--from-build` SEO validation.
//
// Strategy (see DESIGN discussion): a deterministic baseline computed at sync
// time (always valid, zero-cost, CI-safe) plus optional agent-authored
// overrides cached in config/seo-meta.json, keyed by route and invalidated by
// a content hash so only new/changed docs are (re)generated.
//
// Used by: sync-design-log.cjs, sync-agent-kit-docs.cjs (read baseline+cache),
//          generate-seo.mjs (write cache).

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT_DIR = path.resolve(__dirname, "..");
const CACHE_FILE = path.join(ROOT_DIR, "config", "seo-meta.json");

// Recommended SEO limits (the validator warns above these).
const TITLE_MAX = 60;
const DESCRIPTION_MAX = 155; // keep a margin under the 160 hard limit

// The branding suffix each template appends to {post.title} in <title>.
// MUST stay in sync with the literal `<title>` in each page.jay-html — the
// title budget below subtracts it so title+suffix stays under TITLE_MAX.
const SECTION_SUFFIX = {
  "design-log/jay": " — Jay Design Log",
  "design-log/wix": " — Wix Design Log",
  "design-log/website": " — Website Design Log",
  "docs/developer": " — Developer",
  "docs/devops": " — DevOps",
  "docs/contracts": " — Contracts",
  "docs/plugin": " — Plugin",
  "docs/designer": " — Designer",
};

// The budget for the bare title (post.title), i.e. TITLE_MAX minus the suffix
// the template appends. `key` is a route like "design-log/jay/102-foo".
function titleBudgetFor(key) {
  const prefix = Object.keys(SECTION_SUFFIX)
    .filter((p) => key.startsWith(p + "/"))
    .sort((a, b) => b.length - a.length)[0];
  const suffix = prefix ? SECTION_SUFFIX[prefix] : "";
  return TITLE_MAX - suffix.length;
}

// ── Hashing ──

// Strip a leading YAML frontmatter block so the hash reflects only the body.
function stripFrontmatter(text) {
  const m = text.match(/^﻿?---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  return m ? text.slice(m[0].length) : text;
}

// Stable short hash of a doc's body — the cache invalidation key. Trimmed so
// it matches whether computed pre-frontmatter (sync) or on the written file
// with frontmatter stripped back off (generate-seo).
function bodyHash(text) {
  return crypto
    .createHash("sha256")
    .update(stripFrontmatter(text).trim())
    .digest("hex")
    .slice(0, 16);
}

// ── Cache ──

function loadCache(file = CACHE_FILE) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch {
    return {};
  }
}

function saveCache(cache, file = CACHE_FILE) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  // Sort keys for stable, review-friendly diffs.
  const sorted = {};
  for (const k of Object.keys(cache).sort()) sorted[k] = cache[k];
  fs.writeFileSync(file, JSON.stringify(sorted, null, 2) + "\n");
}

// ── Deterministic extraction ──

// Collapse markdown inline syntax to plain text for a meta description.
function stripInlineMarkdown(s) {
  return s
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // links -> text
    .replace(/`([^`]+)`/g, "$1") // inline code
    .replace(/[*_~]{1,3}([^*_~]+)[*_~]{1,3}/g, "$1") // bold/italic/strike
    .replace(/[*_~`]/g, "") // stray markers
    .replace(/\s+/g, " ")
    .trim();
}

// Strip characters that would be misread downstream. Curly braces are template
// binding syntax in jay-html — prose like "{role}" or "{post.title}" copied into
// a <meta> would be parsed as an (unresolved) binding, so remove the braces.
function sanitizeMeta(s) {
  return String(s || "")
    .replace(/[{}]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Truncate at a word boundary, appending an ellipsis if shortened.
function truncate(s, max) {
  if (s.length <= max) return s;
  const slice = s.slice(0, max - 1);
  const cut = slice.lastIndexOf(" ");
  return (cut > max * 0.6 ? slice.slice(0, cut) : slice).trimEnd() + "…";
}

// Derive a description from the first prose paragraph of a markdown body,
// skipping frontmatter, headings, blockquotes (incl. agent notes), code
// fences, images, HTML and horizontal rules.
function extractDescription(markdown) {
  const body = stripFrontmatter(markdown);
  const lines = body.split(/\r?\n/);
  const paragraph = [];
  let inFence = false;

  for (const raw of lines) {
    const line = raw.trim();
    if (/^(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    if (paragraph.length === 0) {
      // Still looking for the start of the first prose paragraph.
      if (
        line === "" ||
        line.startsWith("#") ||
        line.startsWith(">") ||
        line.startsWith("!") ||
        line.startsWith("<") ||
        line.startsWith("|") ||
        /^[-*+]\s/.test(line) ||
        /^\d+\.\s/.test(line) ||
        /^(-{3,}|_{3,}|\*{3,})$/.test(line)
      ) {
        continue;
      }
      paragraph.push(line);
    } else {
      // Accumulate until the paragraph ends (blank line or block element).
      if (line === "" || line.startsWith("#") || line.startsWith(">")) break;
      paragraph.push(line);
    }
  }

  const text = stripInlineMarkdown(paragraph.join(" "));
  return truncate(text, DESCRIPTION_MAX);
}

// ── Resolution ──

// Resolve the final title + description for a doc: agent override from the
// cache when the content hash still matches, otherwise the deterministic
// baseline. `rawTitle` is the clean (untruncated) title used elsewhere in the
// page body; the returned `title` is budgeted to fit the <title>.
function resolveSeo({ cache, key, markdown, rawTitle }) {
  const hash = bodyHash(markdown);
  const hit = cache && cache[key] && cache[key].hash === hash ? cache[key] : null;
  const budget = titleBudgetFor(key);
  const title = sanitizeMeta(hit && hit.title ? hit.title : rawTitle);
  // Fall back to the title if the body has no extractable prose, so the
  // meta description is never empty.
  const description = sanitizeMeta(
    (hit && hit.description) || extractDescription(markdown) || rawTitle
  );
  return {
    title: truncate(title, budget),
    description: truncate(description, DESCRIPTION_MAX),
    fromCache: Boolean(hit),
  };
}

module.exports = {
  CACHE_FILE,
  TITLE_MAX,
  DESCRIPTION_MAX,
  SECTION_SUFFIX,
  titleBudgetFor,
  stripFrontmatter,
  bodyHash,
  loadCache,
  saveCache,
  stripInlineMarkdown,
  sanitizeMeta,
  truncate,
  extractDescription,
  resolveSeo,
};
