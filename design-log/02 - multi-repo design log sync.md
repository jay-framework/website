# Design Log #02 — Multi-Repo Design Log Sync

## Background

DL#01 established the design log import pipeline for the jay framework repo. The Jay ecosystem also includes the `jay-framework/wix` repo, which has its own design log (31 entries) covering Wix platform integration — stores, cart, members, data, media, and deployment plugins. Both design logs should be published on the website.

### Related

- DL#01 — Design log import (single repo)
- Jay DL#155 — Markdown plugin

## Problem

The sync script was hardcoded to a single repo (`jay-framework/jay`). Adding the wix design log requires:

1. Syncing from two repos independently, each with its own commit hash cache
2. Serving them under distinct routes (`/design-log/jay/[slug]` and `/design-log/wix/[slug]`)
3. Keeping per-repo config files (media tracking, media maps) separate

## Design

### Sync script generalization

Replace hardcoded repo config with an array:

```js
const REPOS = [
  { name: "jay", url: "git@github.com:jay-framework/jay.git", folder: "design-log" },
  { name: "wix", url: "git@github.com:jay-framework/wix.git", folder: "design-log" },
];
```

All paths are derived from `name`:

| Resource | Path pattern |
| --- | --- |
| Markdown content | `content/design-log/{name}/` |
| Public images | `public/design-log/{name}/` |
| Commit hash | `content/design-log/{name}/.sync-hash` |
| Media config | `config/.design-log-media-{name}.json` |
| Media map | `config/.design-log-media-map-{name}.yaml` |

Each repo is synced independently — the script iterates over `REPOS` and applies the full pipeline (clone, normalize, rewrite links, inject notes, frontmatter, upload images if changed, generate media map) to each.

### Route structure

```
src/pages/design-log/
  page.jay-html              ← /design-log (methodology landing page)
  jay/[slug]/page.jay-html   ← /design-log/jay/{slug}
  wix/[slug]/page.jay-html   ← /design-log/wix/{slug}
```

Each sub-route's page template points `contentDir` and `mediaMap` to the repo-specific paths. The wix design log has no images, so no `mediaMap` prop is needed.

### Index page

The `/design-log` landing page links to both sub-routes. Each repo has its own `index.md` in the synced content that serves as the entry point for browsing.

## Implementation Results

Implemented as designed. The wix repo has 31 markdown files and no images. Adding a new repo requires only appending to the `REPOS` array and creating a page template under `src/pages/design-log/{name}/[slug]/`.
