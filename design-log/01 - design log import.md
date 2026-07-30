# Design Log #01 — Design Log Import

## Background

The jay-website is the official website for the Jay Framework. The jay framework repo (`jay-framework/jay`) maintains a design log — ~180 markdown files documenting every significant design decision. We want to publish these as pages on the website so they're accessible to anyone exploring the framework.

### Related

- Jay DL#155 — Markdown plugin (the rendering engine we use)
- Jay DL#161 — Markdown image URL resolution (mediaMap feature)

## Problem

The design log lives in the jay repo at `design-log/`. The jay-website is a separate repo. We need to:

1. Pull the design log files without assuming the repos are colocated
2. Render them as pages using the markdown plugin
3. Handle images referenced in the markdown (some files include diagrams and screenshots)
4. Keep the process automated and incremental — don't re-clone or re-upload when nothing changed

### Challenges

- **Filenames have spaces**: `155 - markdown plugin.md` — these need normalizing for URL slugs
- **No frontmatter**: Design log files start with raw markdown, no YAML front matter — the markdown-pages component expects frontmatter for title and SEO
- **Internal cross-references**: Files link to each other using original names with spaces and URL encoding (`[text](06%20-%20state%20management.md)`) — renaming files breaks these links
- **Images**: ~25 PNG/SVG files referenced from markdown with original names — need to be served via Wix Media CDN for production

## Design

### Sync script (`scripts/sync-design-log.cjs`)

A single Node.js script that handles the full pipeline in one call:

```
git clone (sparse) → process markdown → copy images → upload to Wix Media → generate media map
```

#### Git checkout

Uses `git ls-remote` to get the latest commit hash, compares against a stored hash in `content/design-log/.sync-hash`. If unchanged, exits immediately. Otherwise does a sparse clone of just the `design-log/` folder.

#### Filename normalization

All files are renamed: lowercase, non-alphanumeric runs replaced with hyphens. Example: `155 - markdown plugin.md` → `155-markdown-plugin.md`. The slug becomes `155-markdown-plugin`.

#### Frontmatter injection

Files without `---` frontmatter get it added, with title and number extracted from the filename pattern `{number} - {title}`:

```yaml
---
title: "Markdown Plugin"
number: 155
---
```

#### Link rewriting

Before writing files, all internal markdown links are rewritten to match normalized filenames. The script builds a map of every possible reference form (with/without `./`, with/without `.md`, URL-encoded or plain) to the normalized target. Both `[text](target)` and `![alt](image)` links are rewritten.

#### Agent note injection

Each file gets two injected notes:
- After the first `#` heading: a short note linking to the methodology section
- At the end: the full methodology note explaining these are written for AI agents

#### Image handling

Images are copied to `public/design-log/` with normalized names. The script tracks the original → normalized filename mapping in `config/.design-log-media.json`.

On first run (or when image set changes), the script calls:
1. `jay-stack-cli run wix-media/upload-public --folder design-log` — uploads to Wix CDN
2. `jay-stack-cli run wix-media/rebuild-index` — refreshes the MEDIA-INDEX with CDN URLs

When images haven't changed between runs, upload is skipped entirely.

#### Media map generation

The script generates `config/.design-log-media-map.yaml` mapping original image filenames to CDN URLs (parsed from `agent-kit/references/wix-media/MEDIA-INDEX.md`). Falls back to local normalized filenames if upload hasn't happened yet.

### Output locations

| What | Path | Gitignored |
| --- | --- | --- |
| Processed markdown | `content/design-log/` | Yes (`content` is gitignored) |
| Images for upload | `public/design-log/` | Yes (`public` is gitignored) |
| Commit hash cache | `content/design-log/.sync-hash` | Yes |
| Image name mapping | `config/.design-log-media.json` | No |
| Media map (CDN URLs) | `config/.design-log-media-map.yaml` | No |

### Page template (`src/pages/design-log/[slug]/page.jay-html`)

Uses the `markdown-pages` headless component:

```html
<script type="application/jay-headless"
        plugin="@jay-framework/markdown"
        contract="markdown-pages"
        key="post">
  contentDir: content/design-log
  mediaMap: config/.design-log-media-map.yaml
</script>
```

Renders `{post.content}` inside a `.md` container with custom styles for headings, code blocks, tables, blockquotes, mermaid diagrams, and syntax highlighting tokens.

### Build integration

`yarn sync:design-log` runs the script. It's also wired into `build:production` so the design log is always fresh before a production build.

## Implementation Results

Implemented as designed. Key numbers from a typical sync:

- 176 markdown files processed
- 25 images uploaded to Wix Media CDN
- 25/25 media map entries resolved to CDN URLs
- Second run with unchanged hash: exits in <1s
- Second run with changed hash but same images: skips upload, ~10s total
