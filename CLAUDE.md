# CLAUDE.md

This is a Jay Stack project — the official website for the Jay Framework.

## Getting Started

Run `yarn setup` then `yarn agent-kit` to generate the agent kit.

Read `agent-kit/` for contracts, plugin references, and role guides. See the `/jay` skill for full details on the agent kit structure, CLI commands, and project organization.

Before making changes, read `agent-kit/plugins-index.yaml` and the relevant role guide (`agent-kit/designer/`, `agent-kit/developer/`, etc.).

Run `yarn validate` after changes.

## Design Log

This project syncs the design log from the jay framework repo (`jay-framework/jay`). The design log captures design decisions as they happen and is the source of truth for the framework's architecture.

### Syncing

Run `yarn sync:design-log` to pull the latest design log. This clones the design-log folder from the jay repo, processes markdown files into `content/design-log/`, copies images to `public/design-log/`, uploads new images to Wix Media, and generates the media map. The script caches the commit hash and skips re-cloning when up to date. Use `--force` to re-sync regardless.

### Reading Design Logs

Before searching the codebase or guessing at how things work, check the design log index at `content/design-log/index.md` to find relevant entries. Design logs explain architecture, patterns, and rationale — use them as your starting point.

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
