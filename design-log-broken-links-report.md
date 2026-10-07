# Broken Links in Design-Log & Docs Source Content

**For:** the `jay-framework/jay` repo agent (and `jay-framework/wix` for the wix entries).
**Reported from:** the jay-website build, via `npm run validate -- --from-build` (validates the final rendered pages).
**Count:** 40 broken links across design-log entries and agent-kit docs.

These links live in the **source markdown**, not in the website. The website syncs that
markdown verbatim (`npm run sync:design-log`, and the agent kit for `/docs/*`), so they must be
fixed at the source.

## How the website routes this content

So you can predict what a link resolves to:

- Design-log files become routes under `/design-log/{repo}/{slug}` where `repo` is `jay`,
  `wix`, or `website`, and `slug` is the filename **lowercased, spaces → hyphens, `.md`
  dropped**. Example: `142 - ui-kit-add-menu-contribution.md` → `/design-log/jay/142-ui-kit-add-menu-contribution`.
- Agent-kit docs become `/docs/{role}/{slug}`; the role entry files `GUIDE.md` / `INSTRUCTIONS.md`
  become slugs `guide` / `instructions` (**lowercase**).
- Relative links are resolved against the page's own URL. A link is "broken" when it resolves to
  a path the site does not build.

A link breaks when it (a) points at a monorepo **source file** (`.ts`), (b) points at a
**sibling folder** not published to the site (`exploration/`, `examples/`), (c) points into a
**different repo**, (d) uses **wrong case** (`GUIDE` vs `guide`), or (e) uses the **wrong number
of `../`** or leaves **spaces/`.md`** in the target.

---

## Class A — Links to monorepo source `.ts` / example files (11)

These point at files in the monorepo tree, which are not website routes. **Fix:** make them
absolute GitHub URLs (e.g. `https://github.com/jay-framework/jay/blob/main/packages/...`), or
render them as inline code (backticks) instead of links.

| Source entry (route) | Link in source |
| --- | --- |
| `/design-log/jay/03-runtime` | `../packages/list-compare/lib/random-access-linked-list.ts` |
| `/design-log/jay/03-runtime` | `../packages/runtime/lib/kindergarden.ts` |
| `/design-log/jay/03-runtime` | `../packages/list-compare/lib/list-compare.ts` |
| `/design-log/jay/03-runtime` | `../packages/runtime/lib/element.ts` |
| `/design-log/jay/22-serialized-mutable` | `../packages/list-compare/lib/list-compare.ts` |
| `/design-log/jay/26-jay-start-compiling-sandbox-application` | `../packages/compiler/lib/jay-file/jay-file-compiler.ts#883` |
| `/design-log/jay/26-jay-start-compiling-sandbox-application` | `../packages/compiler/lib/ts-file/transform-component-bridge.ts` |
| `/design-log/jay/45-view-state-types` | `..%2Fpackages%2Fcompiler%2Fcompiler-shared%2Flib%2Fjay-type.ts` (also URL-encoded — see Class F) |
| `/design-log/jay/49-full-stack-component-rendering-manifest` | `packages/jay-stack/full-stack-component/lib/jay-stack-builder.ts` |
| `/design-log/jay/38-contract-file` | `..%2Fexamples%2Fjay%2Ftodo-one-flat-component` (example dir; also URL-encoded) |
| `/design-log/wix/20-wix-stores-add-menu-contribution` | `../packages/wix-stores/lib/setup.ts` *(in the **wix** repo)* |

---

## Class B — Docs cross-links with wrong case or depth (8)

Agent-kit role guides linking to each other. **Fix:** lowercase `GUIDE`/`INSTRUCTIONS`, and
correct the `../` depth. These are in the **plugin doc sources** that generate the agent kit.

| Source doc (route) | Link in source | Should be |
| --- | --- | --- |
| `/docs/designer/design-system-guide` | `../contracts/GUIDE` | `../contracts/guide` |
| `/docs/designer/instructions` | `../contracts/GUIDE` | `../contracts/guide` |
| `/docs/developer/instructions` | `../contracts/GUIDE` | `../contracts/guide` |
| `/docs/developer/page-contracts` | `../contracts/GUIDE` | `../contracts/guide` |
| `/docs/plugin/contracts-guide` | `../contracts/GUIDE` | `../contracts/guide` |
| `/docs/plugin/instructions` | `../contracts/GUIDE` | `../contracts/guide` |
| `/docs/developer/cli-commands` | `../devops/INSTRUCTIONS` | `../devops/instructions` |
| `/docs/designer/popover-menu` | `../../designer/navigation-patterns` | `../designer/navigation-patterns` (one fewer `../`) |

---

## Class C — Docs links to unpublished `examples/` pages (9)

The contracts guide references an `examples/` subfolder that is **not published as website
routes**. **Fix (needs a content decision):** either publish those example pages, point the links
at GitHub, or remove them.

| Source doc (route) | Link in source |
| --- | --- |
| `/docs/contracts/guide` | `examples/cart-indicator` |
| `/docs/contracts/guide` | `examples/category-list` |
| `/docs/contracts/guide` | `examples/composing-contracts` |
| `/docs/contracts/guide` | `examples/mini-cart` |
| `/docs/contracts/guide` | `examples/product-card` |
| `/docs/contracts/guide` | `examples/product-page` |
| `/docs/contracts/linked-contracts` | `examples/composing-contracts` |
| `/docs/designer/contracts-and-plugins` | `../contracts/examples/category-list` |
| `/docs/designer/jay-html-template-syntax` | `../contracts/examples/category-list` |

---

## Class D — Design-log internal cross-references (spaces / depth / missing target) (5)

Links between design-log entries that don't resolve. **Fix:** target an entry that exists, and
write the link so it normalizes correctly (prefer `./number-title-words` with hyphens and no
`.md`; avoid spaces, `%20`, and duplicated `design-log/` prefixes).

| Source entry (route) | Link in source | Note |
| --- | --- | --- |
| `/design-log/jay/196-validated-inline-composition` | `198 - free refs as boundary event sources` | Entry 198 is not published (missing, or not yet synced). Verify it exists; use a hyphenated slug. |
| `/design-log/jay/index` | `179%20-%20compiler-free%20plugin%20runtime%20%28validator%20entry%20split%29` | URL-encoded spaces/parens; entry 179 not produced. |
| `/design-log/jay/88-pr-158-review-guide` | `design-log/67%20-%20Figma%20Vendor%20Convesion%20Algorithm` | Duplicated `design-log/` prefix + spaces (and a typo "Convesion"). |
| `/design-log/wix/readme` | `./27%20-%20interactive-setup-for-wix-plugins` | Entry 27 (wix) not produced; check it exists. |
| — | — | *(see Class E for the exploration/ sibling links)* |

---

## Class E — Links to unpublished sibling folders & other repos (8)

### `exploration/` siblings (not synced to the website)
| Source entry (route) | Link in source |
| --- | --- |
| `/design-log/jay/05-events` | `../exploration` |
| `/design-log/jay/22-serialized-mutable` | `../exploration/deserialization-benchmark` |
| `/design-log/jay/23-json-compare-and-patch` | `../exploration/rfc6902` |

**Fix:** if these exploration docs should be public, sync/publish them; otherwise link to GitHub
or remove.

### Cross-repo links (jay ↔ wix ↔ jay-aiditor)
Each repo's design log is a separate route tree on the site, so `../../<other-repo>/...` never
resolves. **Fix:** use absolute site URLs (e.g. `https://<site>/design-log/jay/142-...`) or GitHub.

| Source entry (route) | Link in source |
| --- | --- |
| `/design-log/jay/142-ui-kit-add-menu-contribution` | `../../jay-aiditor/design-log/19%20-%20aiditor-add-menu` |
| `/design-log/wix/20-wix-stores-add-menu-contribution` | `../../jay/design-log/142%20-%20ui-kit-add-menu-contribution` |
| `/design-log/wix/20-wix-stores-add-menu-contribution` | `../jay-aiditor/design-log/19%20-%20aiditor-add-menu` |
| `/design-log/wix/20-wix-stores-add-menu-contribution` | `../jay-aiditor/design-log/19%20-%20aiditor-add-menu-implementation-plan` |
| `/design-log/wix/readme` | `../../jay/design-log/readme` |

---

## Class F — URL-encoded link targets (cross-cutting)

Several links above are written with `%2F`/`%20` (URL-encoded slashes/spaces), e.g.
`..%2Fpackages%2F...ts` and `179%20-%20...`. These never normalize to a real route. Author links
with plain characters so they resolve (and apply the Class A/D fixes to the target itself).

---

## Suggested priority

1. **Class B** — trivial, mechanical (case + `../` depth); highest value, lowest risk.
2. **Class A / F** — convert source-file links to GitHub URLs or inline code.
3. **Class D / E** — verify target entries exist; fix cross-repo/sibling links to absolute URLs.
4. **Class C** — needs a product decision on whether the `examples/` pages get published.
