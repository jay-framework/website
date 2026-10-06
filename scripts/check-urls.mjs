#!/usr/bin/env node

/**
 * Warms Artifactory cache for scoped npm packages.
 * Generated from node_modules — run before yarn install when cache is cold.
 *
 * Usage:
 *   node scripts/check-urls.mjs                    # warms all known URLs
 *   node scripts/check-urls.mjs urls.txt           # reads URLs from file
 */

const URLS = [
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/data-files/-/data-files-0.25.0.tgz",
    "https://npm.dev.wixpress.com/@nodelib%2ffs.walk",
    "https://npm.dev.wixpress.com/@nodelib%2ffs.stat",
    "https://npm.dev.wixpress.com/run-parallel",
    "https://npm.dev.wixpress.com/micromatch",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/aiditor-quill/-/aiditor-quill-0.25.0.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/markdown/-/markdown-0.25.0.tgz",
    "https://npm.dev.wixpress.com/@nodelib%2ffs.scandir",
    "https://npm.dev.wixpress.com/@jay-framework%2fcompiler-inline-composition",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/aiditor-quill/-/aiditor-quill-0.24.4.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/data-files/-/data-files-0.24.4.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/markdown/-/markdown-0.24.4.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/aiditor-quill/-/aiditor-quill-0.24.2.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/aiditor/-/aiditor-0.24.2.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/data-files/-/data-files-0.24.2.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/design-system-validator/-/design-system-validator-0.24.2.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/wix-media/-/wix-media-0.24.2.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/markdown/-/markdown-0.24.2.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/wix-utils/-/wix-utils-0.24.2.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/wix-server-client/-/wix-server-client-0.24.2.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/wix-deploy/-/wix-deploy-0.24.2.tgz",
    "https://npm.dev.wixpress.com/@jay-framework%2fstack-server-build",
    "https://npm.dev.wixpress.com/@jay-framework%2fproduction-build",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/compiler/-/compiler-0.24.1.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/aiditor-quill/-/aiditor-quill-0.24.1.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/aiditor/-/aiditor-0.24.1.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/compiler-analyze-exported-types/-/compiler-analyze-exported-types-0.24.1.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/compiler-jay-stack/-/compiler-jay-stack-0.24.1.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/compiler-shared/-/compiler-shared-0.24.1.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/dev-server/-/dev-server-0.24.1.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/data-files/-/data-files-0.24.1.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/design-system-validator/-/design-system-validator-0.24.1.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/component/-/component-0.24.1.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/jay-cli/-/jay-cli-0.24.1.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/list-compare/-/list-compare-0.24.1.tgz",
    "https://npm.dev.wixpress.com/fill-range",
    "https://npm.dev.wixpress.com/prettier",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/fullstack-component/-/fullstack-component-0.24.1.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/jay-stack-cli/-/jay-stack-cli-0.24.1.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/plugin-validator/-/plugin-validator-0.24.1.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/json-patch/-/json-patch-0.24.1.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/production-server/-/production-server-0.24.1.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/reactive/-/reactive-0.24.1.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/markdown/-/markdown-0.24.1.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/compiler-jay-html/-/compiler-jay-html-0.24.1.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/runtime-automation/-/runtime-automation-0.24.1.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/rollup-plugin/-/rollup-plugin-0.24.1.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/runtime/-/runtime-0.24.1.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/secure/-/secure-0.24.1.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/seo-validator/-/seo-validator-0.24.1.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/ssr-runtime/-/ssr-runtime-0.24.1.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/stack-client-runtime/-/stack-client-runtime-0.24.1.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/ui-kit/-/ui-kit-0.24.1.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/stack-server-runtime/-/stack-server-runtime-0.24.1.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/logger/-/logger-0.24.1.tgz",
    "https://npm.dev.wixpress.com/fastq",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/serialization/-/serialization-0.24.1.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/typescript-bridge/-/typescript-bridge-0.24.1.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/stack-route-scanner/-/stack-route-scanner-0.24.1.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/vite-plugin/-/vite-plugin-0.24.1.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/wix-deploy/-/wix-deploy-0.24.1.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/a11y-validator/-/a11y-validator-0.24.1.tgz",
    "https://npm.dev.wixpress.com/abbrev",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/wix-server-client/-/wix-server-client-0.24.1.tgz",
    "https://npm.dev.wixpress.com/editorconfig",
    "https://npm.dev.wixpress.com/@one-ini%2fwasm",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/view-state-merge/-/view-state-merge-0.24.1.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/wix-media/-/wix-media-0.24.1.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/wix-utils/-/wix-utils-0.24.1.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/aiditor-quill/-/aiditor-quill-0.24.0.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/data-files/-/data-files-0.24.0.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/markdown/-/markdown-0.24.0.tgz",
    "https://npm.dev.wixpress.com/@jay-framework%2fdata-files",
    "https://npm.dev.wixpress.com/@inquirer%2fcheckbox",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/design-system-validator/-/design-system-validator-0.23.1.tgz",
    "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/markdown/-/markdown-0.23.1.tgz",
    "https://npm.dev.wixpress.com/inline-style-parser",
    "https://npm.dev.wixpress.com/proto-list",
    "https://npm.dev.wixpress.com/js-cookie",
    "https://npm.dev.wixpress.com/config-chain",
    "https://npm.dev.wixpress.com/tiny-inflate",
    "https://npm.dev.wixpress.com/fast-string-truncated-width",
    "https://npm.dev.wixpress.com/fast-string-width",
    "https://npm.dev.wixpress.com/vite",
    "https://npm.dev.wixpress.com/upper-case-first",
    "https://npm.dev.wixpress.com/snake-case",
    "https://npm.dev.wixpress.com/sentence-case",
    "https://npm.dev.wixpress.com/path-case",
    "https://npm.dev.wixpress.com/pascal-case",
    "https://npm.dev.wixpress.com/param-case",
    "https://npm.dev.wixpress.com/header-case",
    "https://npm.dev.wixpress.com/dot-case",
    "https://npm.dev.wixpress.com/capital-case",
    "https://npm.dev.wixpress.com/camel-case",
    "https://npm.dev.wixpress.com/@jay-framework%2fwix-utils",
    "https://npm.dev.wixpress.com/fast-wrap-ansi",
    "https://npm.dev.wixpress.com/get-port",
    "https://npm.dev.wixpress.com/fontkitten",
    "https://npm.dev.wixpress.com/@capsizecss%2funpack",
    "https://npm.dev.wixpress.com/js-beautify",
    "https://npm.dev.wixpress.com/change-case",
    "https://npm.dev.wixpress.com/@capsizecss%2fmetrics",
    "https://npm.dev.wixpress.com/@types%2fjs-yaml",
    "https://npm.dev.wixpress.com/@capsizecss%2fcore",
    "https://npm.dev.wixpress.com/style-to-object",
    "https://npm.dev.wixpress.com/pluralize",
    "https://npm.dev.wixpress.com/pegjs",
    "https://npm.dev.wixpress.com/@jay-framework%2fwix-server-client",
    "https://npm.dev.wixpress.com/@jay-framework%2fwix-media",
    "https://npm.dev.wixpress.com/@jay-framework%2fwix-deploy",
    "https://npm.dev.wixpress.com/@jay-framework%2fseo-validator",
    "https://npm.dev.wixpress.com/@jay-framework%2fmarkdown",
    "https://npm.dev.wixpress.com/@jay-framework%2fdesign-system-validator",
    "https://npm.dev.wixpress.com/@jay-framework%2faiditor-quill",
    "https://npm.dev.wixpress.com/@jay-framework%2faiditor",
    "https://npm.dev.wixpress.com/@jay-framework%2fa11y-validator",
  "https://npm.dev.wixpress.com/@anthropic-ai/claude-agent-sdk-darwin-arm64/-/claude-agent-sdk-darwin-arm64-0.2.119.tgz",
  "https://npm.dev.wixpress.com/api/npm/npm-repos/@jay-framework/ui-kit/-/ui-kit-0.23.1.tgz",
  "https://npm.dev.wixpress.com/@anthropic-ai/claude-agent-sdk/-/claude-agent-sdk-0.2.119.tgz",
  "https://npm.dev.wixpress.com/@jay-framework%2fserialization",
  "https://npm.dev.wixpress.com/@jay-framework%2flist-compare",
  "https://npm.dev.wixpress.com/@jay-framework%2fvite-plugin",
  "https://npm.dev.wixpress.com/@jay-framework%2frollup-plugin",
  "https://npm.dev.wixpress.com/@jay-framework%2fview-state-merge",
  "https://npm.dev.wixpress.com/@jay-framework%2fstack-route-scanner",
  "https://npm.dev.wixpress.com/@jay-framework%2fsecure",
  "https://npm.dev.wixpress.com/@jay-framework%2fssr-runtime",
  "https://npm.dev.wixpress.com/@jay-framework%2fproduction-server",
  "https://npm.dev.wixpress.com/@jay-framework%2fcompiler-analyze-exported-types",
  "https://npm.dev.wixpress.com/@jay-framework%2fdev-server",
  "https://npm.dev.wixpress.com/@jay-framework%2flogger",
  "https://npm.dev.wixpress.com/@jay-framework%2fruntime-automation",
  "https://npm.dev.wixpress.com/@jay-framework%2fruntime",
  "https://npm.dev.wixpress.com/@jay-framework%2fjson-patch",
  "https://npm.dev.wixpress.com/@jay-framework%2ftypescript-bridge",
  "https://npm.dev.wixpress.com/@jay-framework%2freactive",
  "https://npm.dev.wixpress.com/@jay-framework%2fplugin-validator",
  "https://npm.dev.wixpress.com/@jay-framework%2ffullstack-component",
  "https://npm.dev.wixpress.com/@jay-framework%2fcomponent",
  "https://npm.dev.wixpress.com/@jay-framework%2fcompiler",
  "https://npm.dev.wixpress.com/@jay-framework%2fcompiler-shared",
  "https://npm.dev.wixpress.com/@jay-framework%2fcompiler-jay-html",
  "https://npm.dev.wixpress.com/@jay-framework%2fui-kit",
  "https://npm.dev.wixpress.com/@jay-framework%2fstack-client-runtime",
  "https://npm.dev.wixpress.com/@jay-framework%2fjay-cli",
  "https://npm.dev.wixpress.com/@jay-framework%2fstack-server-runtime",
  "https://npm.dev.wixpress.com/@jay-framework%2fcompiler-jay-stack",
  "https://npm.dev.wixpress.com/@jay-framework%2fjay-stack-cli",
];

async function checkUrl(url) {
  const start = Date.now();
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    const ms = Date.now() - start;
    return { url, status: res.status, ok: res.ok, ms };
  } catch (err) {
    const ms = Date.now() - start;
    return { url, status: 0, ok: false, ms, error: err.message };
  }
}

async function loadUrls() {
  const arg = process.argv[2];
  if (arg) {
    const fs = await import("node:fs/promises");
    const content = await fs.readFile(arg, "utf-8");
    return content
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#"));
  }
  return URLS;
}

async function main() {
  const urls = await loadUrls();
  console.log(`Warming ${urls.length} URLs...\n`);

  const results = await Promise.all(urls.map(checkUrl));

  const passed = results.filter((r) => r.ok);
  const failed = results.filter((r) => !r.ok);

  for (const r of failed) {
    const detail = r.error || `HTTP ${r.status}`;
    console.log(`  ❌ ${detail} ${r.url} (${r.ms}ms)`);
  }

  console.log(`\n${passed.length} passed, ${failed.length} failed`);
  if (failed.length > 0) process.exit(1);
}

main();
