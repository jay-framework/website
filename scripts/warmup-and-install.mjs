#!/usr/bin/env node

/**
 * Repeatedly runs `npm install`, extracts failing package URLs,
 * warms them in Artifactory via HTTP GET, and retries.
 * Stops when npm install succeeds or no new packages are found.
 */

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const CHECK_URLS_PATH = "scripts/check-urls.mjs";
const REGISTRY = "https://npm.dev.wixpress.com";
const MAX_RETRIES = 200;

function extractFailingUrl(output) {
  // yarn format: "Request URL: https://npm.dev.wixpress.com/..."
  const yarnMatch = output.match(
    /Request URL: (https:\/\/npm\.dev\.wixpress\.com\/[^\s]+)/,
  );
  if (yarnMatch) return yarnMatch[1];

  // npm format: "GET https://npm.dev.wixpress.com/... - {"errors":..."
  const npmGetMatch = output.match(
    /GET (https:\/\/npm\.dev\.wixpress\.com\/[^\s]+)\s*-\s*\{/,
  );
  if (npmGetMatch) return npmGetMatch[1];

  // npm format: "npm.dev.wixpress.com/@scope%2fname - {"errors":..."
  const npmUrlMatch = output.match(
    /\.wixpress\.com\/([@\w][^\s]*)\s*-\s*\{/,
  );
  if (npmUrlMatch) return `${REGISTRY}/${npmUrlMatch[1]}`;

  // npm 404: "'name@version' could not be found"
  const npm404Match = output.match(
    /'((?:@[^/]+\/)?[^@']+)@[^']*' could not be found/,
  );
  if (npm404Match) {
    const encoded = npm404Match[1].replace("/", "%2f");
    return `${REGISTRY}/${encoded}`;
  }

  return null;
}

function addUrlToScript(url) {
  const content = readFileSync(CHECK_URLS_PATH, "utf-8");
  if (content.includes(url)) return false;

  const updated = content.replace(
    "const URLS = [",
    `const URLS = [\n    "${url}",`,
  );
  writeFileSync(CHECK_URLS_PATH, updated);
  return true;
}

async function warmUrl(url) {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    console.log(`  ${res.ok ? "✅" : "❌"} ${res.status} ${url}`);
    return res.ok;
  } catch (err) {
    console.log(`  ❌ ${err.message} ${url}`);
    return false;
  }
}

async function main() {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    console.log(`\n--- Attempt ${attempt} ---`);
    let output;
    try {
      output = execSync("npm install", {
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
        timeout: 180_000,
      });
      console.log("✅ npm install succeeded!");
      return;
    } catch (err) {
      output = (err.stdout || "") + (err.stderr || "");
    }

    const url = extractFailingUrl(output);
    if (!url) {
      console.log("❌ npm install failed but no package URL found in output:");
      console.log(output.slice(-500));
      process.exit(1);
    }

    console.log(`Missing package: ${url}`);
    const isNew = addUrlToScript(url);
    if (isNew) {
      console.log(`Added to ${CHECK_URLS_PATH}`);
    }

    console.log("Warming all known URLs...");
    try {
      execSync(`node ${CHECK_URLS_PATH}`, {
        encoding: "utf-8",
        stdio: "inherit",
        timeout: 60_000,
      });
    } catch {
      console.log("⚠️  Some warmups failed — retrying anyway");
    }
  }

  console.log(`❌ Failed after ${MAX_RETRIES} attempts`);
  process.exit(1);
}

main();
