#!/usr/bin/env node
// ── Agent-authored SEO titles/descriptions ──
//
// Decoupled from sync/build so the build stays deterministic and offline. Walks
// the synced markdown, and for every doc whose body hash isn't already cached,
// asks Claude for a concise <title> and <meta description>, writing results to
// config/seo-meta.json. The sync scripts read that cache as an override on top
// of their deterministic baseline (see scripts/seo-meta.cjs).
//
// Auth: uses @anthropic-ai/claude-agent-sdk, which authenticates the same way
// the `claude` CLI does — your `claude login` credentials. No ANTHROPIC_API_KEY
// required (though one is honored if set). If the agent is unavailable (not
// logged in, offline), generation degrades to the deterministic baseline.
//
// Usage:
//   node scripts/generate-seo.mjs [--force] [--limit N]
//                                 [--section <prefix>] [--dry-run] [--concurrency N]
//
// Run it, commit the updated config/seo-meta.json, then re-sync (or build).

import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { query } from "@anthropic-ai/claude-agent-sdk";

const require = createRequire(import.meta.url);
const seo = require("./seo-meta.cjs");

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT_ROOTS = ["content/design-log", "content/docs"];

const argv = process.argv.slice(2);
const FORCE = argv.includes("--force");
const DRY_RUN = argv.includes("--dry-run");
const LIMIT = numArg("--limit", Infinity);
const SECTION = strArg("--section", null);
const CONCURRENCY = numArg("--concurrency", 3);
// Defaults to the CLI's model; override with a full id or alias (e.g. "haiku").
const MODEL = process.env.SEO_MODEL || "haiku";

function numArg(flag, dflt) {
  const i = argv.indexOf(flag);
  return i >= 0 && argv[i + 1] ? Number(argv[i + 1]) : dflt;
}
function strArg(flag, dflt) {
  const i = argv.indexOf(flag);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : dflt;
}

// ── Collect candidate docs ──

function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile() && entry.name.endsWith(".md")) out.push(full);
  }
  return out;
}

function parseFrontmatterTitle(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (m) {
    const t = m[1].match(/^title:\s*"?(.*?)"?\s*$/m);
    if (t) return t[1].replace(/\\"/g, '"');
  }
  const h1 = seo.stripFrontmatter(text).match(/^#\s+(.+)$/m);
  return h1 ? h1[1].trim() : "";
}

function collect() {
  const docs = [];
  for (const root of CONTENT_ROOTS) {
    for (const file of walk(path.join(ROOT_DIR, root))) {
      const key = path
        .relative(path.join(ROOT_DIR, "content"), file)
        .replace(/\\/g, "/")
        .replace(/\.md$/, "");
      if (SECTION && !key.startsWith(SECTION)) continue;
      docs.push({ key, file });
    }
  }
  return docs;
}

// ── LLM call (via the Claude Agent SDK — same auth as the `claude` CLI) ──

async function callModel(system, user) {
  const run = query({
    prompt: user,
    options: {
      model: MODEL,
      systemPrompt: system,
      allowedTools: [], // pure text generation — no tools, no file access
      settingSources: [], // ignore project CLAUDE.md / settings
      cwd: ROOT_DIR,
    },
  });

  let result = null;
  for await (const msg of run) {
    if (msg.type === "result") {
      if (msg.subtype === "success") result = msg.result;
      else throw new Error(`agent ${msg.subtype}${msg.result ? `: ${msg.result}` : ""}`);
    }
  }
  if (result == null) throw new Error("agent returned no result");
  return result;
}

async function generateFor(doc, cache) {
  const text = fs.readFileSync(doc.file, "utf-8");
  const hash = seo.bodyHash(text);
  if (!FORCE && cache[doc.key] && cache[doc.key].hash === hash) {
    return { status: "cached" };
  }

  const titleBudget = seo.titleBudgetFor(doc.key);
  const rawTitle = parseFrontmatterTitle(text);
  const body = seo.stripFrontmatter(text).replace(/\s+/g, " ").trim().slice(0, 4000);

  const system =
    "You write concise SEO metadata for technical documentation pages. " +
    'Reply with ONLY a JSON object: {"title": string, "description": string}. No prose, no code fences.';
  const user =
    `Page topic (current title): ${rawTitle}\n\n` +
    `Content excerpt:\n${body}\n\n` +
    `Write:\n` +
    `- "title": a specific page title, at most ${titleBudget} characters, with NO site name or suffix (the template appends branding).\n` +
    `- "description": a compelling meta description, 120-${seo.DESCRIPTION_MAX} characters, summarizing what the page covers.`;

  const text_out = (await callModel(system, user)).trim().replace(/^```json\s*|\s*```$/g, "");
  let parsed;
  try {
    parsed = JSON.parse(text_out);
  } catch {
    throw new Error(`Unparseable model output: ${text_out.slice(0, 200)}`);
  }

  const title = seo.truncate(seo.sanitizeMeta(parsed.title || rawTitle), titleBudget);
  const description = seo.truncate(
    seo.sanitizeMeta(parsed.description || ""),
    seo.DESCRIPTION_MAX
  );
  if (!description) throw new Error("Model returned empty description");

  cache[doc.key] = { hash, title, description };
  patchContentFile(doc.file, text, title, description);
  return { status: "generated", title, description };
}

// Patch the already-synced file's title/description in place so the same build
// that runs generate:seo renders the agent copy (build:production ordering).
// The content hash is over the body, so rewriting frontmatter keeps it stable;
// the committed cache is still the source of truth across syncs.
function patchContentFile(file, text, title, description) {
  const esc = (s) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  let next = text;
  if (/^title:/m.test(next)) {
    next = next.replace(/^title:.*$/m, `title: "${esc(title)}"`);
  }
  if (/^description:/m.test(next)) {
    next = next.replace(/^description:.*$/m, `description: "${esc(description)}"`);
  }
  if (next !== text) fs.writeFileSync(file, next);
}

// ── Main ──

async function main() {
  const cache = seo.loadCache();
  const docs = collect();
  const pending = docs.filter((doc) => {
    const text = fs.readFileSync(doc.file, "utf-8");
    return FORCE || !(cache[doc.key] && cache[doc.key].hash === seo.bodyHash(text));
  });
  const todo = pending.slice(0, LIMIT);

  console.log(
    `${docs.length} docs, ${pending.length} need generation` +
      (todo.length < pending.length ? ` (limiting to ${todo.length})` : "") +
      `, model ${MODEL}${DRY_RUN ? " [dry-run]" : ""}`
  );
  if (DRY_RUN) {
    for (const d of todo) console.log(`  would generate: ${d.key}`);
    return;
  }
  if (!todo.length) {
    console.log("Nothing to generate — cache is up to date.");
    return;
  }

  let done = 0;
  let failed = 0;
  let saved = 0;

  // Probe with the first doc so an auth/connectivity failure degrades to the
  // deterministic baseline (one warning) instead of one error per doc.
  try {
    const r = await generateFor(todo[0], cache);
    done++;
    console.log(`  [1/${todo.length}] ${todo[0].key} — ${r.title}`);
    seo.saveCache(cache);
  } catch (err) {
    console.warn(
      `Agent SEO generation unavailable (${err.message}) — using deterministic baseline.`
    );
    console.warn(
      "The Claude Agent SDK uses your `claude login` credentials; run `claude` once to authenticate (or set ANTHROPIC_API_KEY)."
    );
    return;
  }

  const queue = todo.slice(1);
  async function worker() {
    while (queue.length) {
      const doc = queue.shift();
      try {
        const r = await generateFor(doc, cache);
        done++;
        console.log(`  [${done}/${todo.length}] ${doc.key} — ${r.title}`);
      } catch (err) {
        failed++;
        console.error(`  ! ${doc.key}: ${err.message}`);
      }
      // Persist periodically so a crash doesn't lose progress.
      if (++saved % 10 === 0) seo.saveCache(cache);
    }
  }

  await Promise.all(Array.from({ length: Math.max(1, CONCURRENCY) }, () => worker()));
  seo.saveCache(cache);

  console.log(`\nDone: ${done} generated, ${failed} failed. Cache: ${seo.CACHE_FILE}`);
  console.log("Commit config/seo-meta.json, then re-run sync (or build).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
