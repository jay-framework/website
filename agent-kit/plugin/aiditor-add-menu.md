# AIditor Add Menu — plugin contributor guide

Design Log #19. This document is installed by `jay-stack setup aiditor` into `agent-kit/plugin/aiditor-add-menu.md`.

## 1. Meaning

Add Menu items are **user-selectable prompt fragments**. When a user picks an item in AIditor, it becomes a **chip** on the request. On submit, AIditor injects the item's **`prompt` verbatim** into the agent task — no mini-forms, no parameter substitution.

- **Q3:** One attachment = one resource in scope. The user may describe multiple uses in prose; the agent may implement 0, 1, or N instances.
- **Q8:** Dynamic route segments (`[slug]`, `[prefix]`, …) are edited in the **page route** / **planned route** field — not on catalog items.

## 2. Paths

Write catalog files under:

```
<project>/agent-kit/aiditor/add-menu/
  <pluginName>.yaml              # static items — setup
  <pluginName>.generated.yaml    # optional dynamic items — rebuild command
```

AIditor merges all `*.yaml` at read time (lexicographic order; later file wins on duplicate `id`).

## 3. Schema

Each file:

```yaml
items:
  - id: <pluginName>:<slug>
    title: User-facing label
    category: Store | Media | Effects | …
    prompt: |
      Complete agent instructions (markdown)
    pluginName: wix-stores # recommended
    packageName: "@jay-framework/wix-stores"
    subCategory: Components # optional navigation
    thumbnail: thumbnails/... # optional UI hint
    interaction: # optional — Design Log #25
      mode: reference | stage-place
      persistOnPage: true # deprecated DL #26 — accepted but ignored
      stagePromptTemplate: | # stage-place only — prefilled marker instruction
        Add spring effect at this location.
```

**`interaction` (optional, DL #25):**

| Field                 | Values                                                                        | Default     |
| --------------------- | ----------------------------------------------------------------------------- | ----------- |
| `mode`                | `reference` — `@` mention in markers; click in + Add dock when marker focused | `reference` |
|                       | `stage-place` — click or drag onto preview creates a marker                   |             |
| `persistOnPage`       | **Deprecated (DL #26)** — ignored; no disk registry                           | n/a         |
| `stagePromptTemplate` | Prefilled marker instruction for `stage-place`                                | item title  |

## AIditor surfaces (DL #26)

| Surface              | Purpose                                               | Plugin guidance                                                                                                                    |
| -------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Page Info**        | Route + components from `jay-html`; contract explorer | Headless contracts appear automatically when in template; no catalog entry required for detection                                  |
| **+ Add dock**       | Visual placement                                      | `interaction.mode: stage-place` + `stagePromptTemplate` for effects/media that land on canvas                                      |
| **`@` autocomplete** | Full catalog reference                                | `mode: reference` (default); categories / high-cardinality → rely on `@` only (`subCategory: Categories` filtered from + Add grid) |

Do **not** rely on page Assets registry or `persistOnPage` for disk persistence — request-level `addMenuAttachments` and `pageComponents` (from `jay-html`) are submitted instead.

**Required:** `id`, `title`, `category`, `prompt`

**Rejected (anti-patterns):** `kind`, `parameters`, `component`, `allowedScopes`, `{{parameters.*}}`

Canonical fixture: `@jay-framework/aiditor` test fixture `test/fixtures/add-menu/valid-item.yaml`

## 4. Materialization

| Source          | When                             | Example                        |
| --------------- | -------------------------------- | ------------------------------ |
| Static template | `jay-stack setup <plugin>`       | One item per headless contract |
| Generated file  | setup `--force`, rebuild command | One item per Wix media file    |

All URLs, IDs, contract keys, and instructions must be **complete in `prompt` at pick time**.

## 5. Setup handler pattern

In your plugin `setup.ts`:

1. Ensure `<project>/agent-kit/aiditor/add-menu/` exists
2. Copy or generate `<pluginName>.yaml` from package template
3. Idempotent — skip if file exists unless `ctx.force`
4. Share generator with optional `rebuild-add-menu` command for `.generated.yaml`

Example (wix-stores): see `packages/wix-stores/lib/setup.ts` → `writeAddMenuCatalog`.

## 6. Examples

**Headless contract (static):**

```yaml
- id: wix-stores:product-page
  title: Product page
  category: Store
  subCategory: Components
  pluginName: wix-stores
  packageName: "@jay-framework/wix-stores"
  prompt: |
    Use headless @jay-framework/wix-stores / product-page (key: p).
    Read agent-kit/materialized-contracts/wix-stores/product-page.jay-contract.
```

**Generated media item (future wix-media):**

```yaml
- id: wix-media:hero-summer-2026
  title: Hero — summer 2026
  category: Media
  pluginName: wix-media
  prompt: |
    URL: https://static.wixstatic.com/media/abc123~mv2.jpg
    Media id: abc123-def-456-789
```

## 7. Q8 contract lookup hint

Use **`id` convention** `<pluginName>:<contractName>` (e.g. `wix-stores:product-page`) so AIditor can resolve `agent-kit/materialized-contracts/<plugin>/<contract>.jay-contract` for route param buttons and collision warnings.

## 8. Verification

1. Run `jay-stack setup <your-plugin>` — yaml appears under `agent-kit/aiditor/add-menu/`
2. Ensure plugin is in `package.json`
3. Open AIditor → Add Page → **+ Add** — items appear under your `category`
4. Run `jay-stack validate` on pages the agent creates

For Add Menu schema questions, read this file. For generic plugin development, read `agent-kit/plugin/INSTRUCTIONS.md`.
