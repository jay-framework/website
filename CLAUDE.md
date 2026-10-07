# CLAUDE.md

This is a Jay Stack project — the official website for the Jay Framework.

## Getting Started

Run `npm run setup` then `npm run agent-kit` to generate the agent kit.

Read `agent-kit/` for contracts, plugin references, and role guides. See the `/jay` skill for full details on the agent kit structure, CLI commands, and project organization.

Before making changes, read `agent-kit/plugins-index.yaml` and the relevant role guide (`agent-kit/designer/`, `agent-kit/developer/`, etc.).

Run `npm run validate` after changes. There are two passes: `npm run validate` checks the page templates, and `npm run validate -- --from-build` validates the final rendered content (dynamic `[slug]` routes expanded) — run a build first, and see the SEO Metadata section below.

## SEO Metadata

Markdown-synced pages (`/design-log/*`, `/docs/*`) get their `<title>` and `<meta name="description">` from frontmatter via `@jay-framework/markdown`. Source markdown mostly lacks descriptions and has long titles, which fails the `--from-build` SEO validation.

This is handled by a two-layer pipeline (see Design Log #06):

- **Deterministic baseline** — the sync scripts (`sync:design-log`, `sync:docs`) inject a `description` (first-paragraph excerpt) and a length-budgeted `title` into frontmatter via `scripts/seo-meta.cjs`. Always valid, zero-cost, offline.
- **Agent overrides** — `npm run generate:seo` asks Claude for higher-quality titles/descriptions, cached in `config/seo-meta.json` (keyed by content hash, committed to git). It only (re)generates new or changed docs and runs as part of `build:production`. It uses `@anthropic-ai/claude-agent-sdk`, which authenticates with your `claude login` credentials (same as the `claude` CLI) — no `ANTHROPIC_API_KEY` needed, though one is honored if set. If the agent is unavailable (not logged in / offline) it degrades gracefully to the baseline.

When editing the `<title>` suffix in a `[slug]` template, keep it in sync with the per-section suffix map in `scripts/seo-meta.cjs` (it sets the title length budget). Never put literal `{...}` in metadata — it's parsed as a binding; `seo-meta.cjs` strips braces for this reason.

## Design Log

This project syncs the design log from the jay framework repo (`jay-framework/jay`). The design log captures design decisions as they happen and is the source of truth for the framework's architecture.

### Syncing

Run `npm run sync:design-log` to pull the latest design log. This clones the design-log folder from the jay repo, processes markdown files into `content/design-log/`, copies images to `public/design-log/`, uploads new images to Wix Media, and generates the media map. The script caches the commit hash and skips re-cloning when up to date. Use `--force` to re-sync regardless.

### Reading Design Logs

Before searching the codebase or guessing at how things work, check the per-repo design log indexes to find relevant entries: `content/design-log/jay/index.md` (framework) and `content/design-log/website/index.md` (this site); Wix entries live under `content/design-log/wix/`. Design logs explain architecture, patterns, and rationale — use them as your starting point.

### Design Log Methodology

The jay framework follows a rigorous design log methodology for all significant features and architectural changes. The design log is the source of truth. Any plan must be validated against the design log before implementation.

1. **Structure**: Background → Problem → Questions and Answers → Design → Implementation Plan → Examples → Trade-offs
2. **Be specific**: Include file paths, type signatures, validation rules
3. **Show examples**: Use checkmark/cross for good/bad patterns, include realistic code
4. **Explain why**: Don't just describe what — explain rationale and trade-offs
5. **Be brief**: Write short explanations and only what is most relevant
6. **Draw diagrams**: Use mermaid inline diagrams when it makes sense

### When Answering Questions

1. **Reference design logs** by number when relevant (e.g., "See Design Log #50")
2. **Check design logs first** before guessing at implementation details
3. **Use codebase terminology**: ViewState, Contract, JayContract, phase annotations
