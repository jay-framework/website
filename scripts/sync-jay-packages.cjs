#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const SCRIPT_DIR = __dirname;
const ROOT_DIR = path.resolve(path.join(SCRIPT_DIR, ".."));
const SOURCE_REPO = path.resolve(args[0] || path.join(SCRIPT_DIR, "..", "..", "jay"));
const WIX_REPO = path.resolve(path.join(SCRIPT_DIR, "..", "..", "wix"));
const AIDITOR_REPO = path.resolve(path.join(SCRIPT_DIR, "..", "..", "aiditor"));
const PACKAGE_PREFIX = "@jay-framework";

const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  reset: "\x1b[0m",
};

if (args.includes("--help") || args.includes("-h")) {
  console.log(`${colors.yellow}Jay Framework Package Sync Script${colors.reset}`);
  console.log("");
  console.log("Syncs built packages from the jay, wix, and aiditor source repos");
  console.log("into this project's node_modules.");
  console.log("");
  console.log("Usage:");
  console.log("  node sync-jay-packages.cjs [source-repo-path]");
  console.log("");
  console.log("Arguments:");
  console.log("  source-repo-path  Path to the jay source repository");
  console.log(`                    Default: ${path.join(SCRIPT_DIR, "..", "..", "jay")}`);
  console.log("");
  console.log("Examples:");
  console.log("  node sync-jay-packages.cjs");
  console.log("  node sync-jay-packages.cjs /path/to/jay");
  process.exit(0);
}

const NAME_MAP = {
  "jay-stack-cli": "stack-cli",
  "jay-cli": "cli",
  "fullstack-component": "full-stack-component",
  "stack-route-scanner": "route-scanner",
  "gemini-agent-plugin": "gemini-agent",
  "webmcp-plugin": "webmcp",
};

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.name === "package.json") continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function findSource(packageName) {
  const actual = NAME_MAP[packageName] || packageName;
  const candidates = [
    path.join(SOURCE_REPO, "packages", "jay-stack", actual),
    path.join(SOURCE_REPO, "packages", "jay-stack-plugins", actual),
    path.join(SOURCE_REPO, "packages", "compiler", actual),
    path.join(SOURCE_REPO, "packages", "runtime", actual),
    path.join(SOURCE_REPO, "packages", "plugins", actual),
    path.join(SOURCE_REPO, "packages", actual),
    path.join(WIX_REPO, "packages", actual),
    path.join(AIDITOR_REPO, "packages", actual),
  ];
  return candidates.find((p) => fs.existsSync(p)) || null;
}

function syncPackage(packageName, sourcePath, targetPath) {
  const sourceDistPath = path.join(sourcePath, "dist");
  const targetDistPath = path.join(targetPath, "dist");

  if (!fs.existsSync(sourceDistPath)) {
    console.log(`  ${colors.red}✗ ${packageName}: dist not found at ${sourceDistPath}${colors.reset}`);
    return false;
  }

  copyDirSync(sourceDistPath, targetDistPath);

  const pluginYaml = path.join(sourcePath, "plugin.yaml");
  if (fs.existsSync(pluginYaml)) {
    fs.copyFileSync(pluginYaml, path.join(targetPath, "plugin.yaml"));
  }

  for (const agentKitName of ["agent-kit-template", "agent-kit"]) {
    const agentKit = path.join(sourcePath, agentKitName);
    if (fs.existsSync(agentKit) && fs.statSync(agentKit).isDirectory()) {
      copyDirSync(agentKit, path.join(targetPath, agentKitName));
    }
  }

  return true;
}

function main() {
  if (!fs.existsSync(SOURCE_REPO)) {
    console.log(`${colors.red}Error: Source repo not found at ${SOURCE_REPO}${colors.reset}`);
    process.exit(1);
  }

  console.log(`${colors.yellow}Jay Framework Package Sync${colors.reset}`);
  console.log(`Source:  ${SOURCE_REPO}`);
  console.log(`Wix:     ${WIX_REPO}`);
  console.log(`Aiditor: ${AIDITOR_REPO}`);
  console.log("");

  const jayDir = path.join(ROOT_DIR, "node_modules", PACKAGE_PREFIX);
  if (!fs.existsSync(jayDir)) {
    console.log(`${colors.red}No ${PACKAGE_PREFIX} in node_modules (run yarn install first)${colors.reset}`);
    process.exit(1);
  }

  const packages = fs.readdirSync(jayDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

  console.log(`${colors.green}jay-website${colors.reset} (${packages.length} packages)`);

  let success = 0;
  let fail = 0;

  for (const pkg of packages) {
    const sourcePath = findSource(pkg);
    if (!sourcePath) {
      console.log(`  ${colors.red}✗ ${pkg}: source not found${colors.reset}`);
      fail++;
      continue;
    }

    try {
      if (syncPackage(pkg, sourcePath, path.join(jayDir, pkg))) {
        console.log(`  ${colors.green}✓${colors.reset} ${pkg}`);
        success++;
      } else {
        fail++;
      }
    } catch (error) {
      console.log(`  ${colors.red}✗ ${pkg}: ${error.message}${colors.reset}`);
      fail++;
    }
  }

  console.log("");
  console.log(`${colors.green}Done: ${success} synced${colors.reset}${fail > 0 ? `, ${colors.red}${fail} failed${colors.reset}` : ""}`);
}

main();
