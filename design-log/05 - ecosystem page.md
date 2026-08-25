---
title: "Ecosystem Page"
number: 5
---

# Design Log #05 — Ecosystem Page

> *Written for AI agents. See [Log Methodology Note](#log-methodology-note) below for details.*

## Background

The Jay website needs a dedicated ecosystem page listing two catalogs:

1. **Templates** — starter project templates, each with a name, GitHub link, example website link, and cover image.
2. **Plugins** — Jay plugins (installable NPM packages), each with a name, GitHub link, short description, and npm coordinates.

Both lists are small, change infrequently, and are maintained manually. They must be checked into git so updates go through normal code review.

### Related

- DL#04 — Docs Sidebar Navigation (component generation pattern)

## Problem

1. The `content/` directory is gitignored because the design-log sync script generates content there. Ecosystem data files need to live in `content/` (where the data-files plugin expects them) but must be tracked in git.
2. The data-files plugin (v0.23.1) has a version mismatch — its contract generators export raw async generator functions but the stack-server-runtime expects objects created by `makeContractGenerator()`. Dynamic contract materialization fails, so the plugin's headless components (`data-list`, `data-pages`, `data-item`) cannot be used.

## Questions and Answers

**How to handle `content/` gitignore for tracked data files?**

Replace the blanket `content` ignore with specific ignores for the generated subdirectories. Currently the only generated content is `content/design-log/` (from the sync script). Ignoring `content/design-log/` instead of all of `content/` lets new data directories like `content/templates/` and `content/plugins/` be tracked normally.

```
# before
content

# after
content/design-log
content/home
content/docs
```

This is cleaner than negation (`!content/templates/`). If new generated content directories are added, they get their own ignore line — explicit is better.

**Should we use the data-files plugin despite the generator issue?**

No. Until the plugin's generators are updated to use `makeContractGenerator()`, the contracts won't materialize and validation will fail. Instead, read the YAML files directly in `page.ts` and pass data through the page contract. The data files still live in `content/` as YAML — same editing experience, same file structure — but the page component handles loading.

When the data-files plugin is fixed, migrating is straightforward: add the headless `<script>` tags back to the jay-html, remove the YAML-loading code from `page.ts`, and simplify the page contract.

**What format for the data files?**

YAML. It's the most readable for hand-editing small lists. Each file is an array of objects with flat string fields — no nesting, no cross-references.

**Where does the page live?**

`/ecosystem` — a new route at `src/pages/ecosystem/`.

## Design

### Data files

```
content/
├── templates/
│   ├── templates.jay-contract   # schema (for future data-files plugin use)
│   └── data.yaml                # template entries
└── plugins/
    ├── plugins.jay-contract     # schema
    └── data.yaml                # plugin entries
```

#### `content/templates/data.yaml`

```yaml
- slug: onsko
  name: Onsko
  githubUrl: https://github.com/nicejaywork/jay-onsko-template
  exampleUrl: https://jay-onsko-52654f57-yoav68.wix-site-host.com/
  coverImage: https://static.wixstatic.com/media/...
```

#### `content/plugins/data.yaml`

Populated from three monorepo sources:

- `../jay/packages/plugins/` — core Jay plugins (8 plugins: a11y-validator, data-files, design-system-validator, gemini-agent, markdown, seo-validator, ui-kit, webmcp)
- `../wix/packages/` — Wix headless integration plugins (9 plugins: wix-server-client, wix-deploy, wix-media, wix-stores, wix-stores-v1, wix-cart, wix-members, wix-data, wix-utils)
- `../aiditor/packages/` — AIditor plugins (2 plugins: aiditor, aiditor-quill)

```yaml
- slug: a11y-validator
  name: Accessibility Validator
  githubUrl: https://github.com/jay-framework/jay
  description: Checks jay-html templates for WCAG best practices...
  npmPackage: "@jay-framework/a11y-validator"
```

### Page contract

The page contract defines two repeated sub-contracts — `templates` and `plugins` — populated in the slow phase from the YAML files.

```yaml
name: ecosystem
tags:
  - tag: templates
    type: sub-contract
    repeated: true
    trackBy: slug
    phase: slow
    tags:
      - tag: slug / name / githubUrl / exampleUrl / coverImage
        type: data
        dataType: string

  - tag: plugins
    type: sub-contract
    repeated: true
    trackBy: slug
    phase: slow
    tags:
      - tag: slug / name / githubUrl / description / npmPackage
        type: data
        dataType: string
```

### Page component (`page.ts`)

Reads both YAML files with `node:fs` + `js-yaml` in `withSlowlyRender` and returns the arrays as phase output.

### Page template (`page.jay-html`)

Two sections:

1. **Templates** — card grid (responsive 1→2→3 columns). Each card: cover image, template name, GitHub link, Live Demo link.
2. **Plugins** — row list. Each row: plugin name, description, npm badge, GitHub link.

Both use `forEach` with `trackBy="slug"`.

### Gitignore change

```gitignore
# before
content

# after — ignore only generated content directories
content/design-log
content/home
content/docs
```

## Trade-offs

- **No data-files plugin** — we lose the plugin's cross-reference resolution and per-item routing. Acceptable since ecosystem data is flat with no cross-references, and we don't need per-item pages.
- **Manual YAML loading** — adds ~5 lines of `page.ts` code. Trivial to remove when the plugin is fixed.
- **Granular gitignore** — requires adding a line when new generated content directories are introduced. This is preferable to negation patterns which are harder to reason about.
