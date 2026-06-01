# Changelog

All notable changes to `@felt-ui/react` are documented here. The format is
based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0]

The first release — all six MVP **trust primitives**, accessible by default and
shadcn-compatible.

### Added

- **`<ToolCall>`** — action card for agent tool use: intent + parameters shown
  before acting, approve/deny, an irreversible "can't be undone" confirmation
  guard, and an honest `proposed | running | done | failed` lifecycle.
- **`<Plan>` / `<Step>`** — agent plan visibility with live per-step status
  (`pending | active | done | failed | skipped`), progress summary, and ARIA
  live announcements.
- **`<Confidence>`** — calibrated uncertainty as an accessible `role="meter"`;
  band conveyed by label + icon + colour (never colour alone). Exports
  `getConfidenceLevel()`.
- **`<Citation>` / `<CitationList>`** — verifiable source attribution: an inline
  marker whose accessible name carries the attribution, a hover/focus preview
  (Radix HoverCard), and a numbered sources section.
- **`<Refusal>`** — graceful decline with ways forward; calm (not an error),
  with a labelled region and a polite live announcement.
- **`<Message>` / `<Composer>`** — accessible streaming (ARIA live body,
  reduced-motion caret, stop/regenerate/copy) and a keyboard-first composer
  (Enter sends, Shift+Enter newline, stop-while-streaming, accessible
  attachments).
- Exported Tailwind preset (`@felt-ui/react/tailwind-preset`), design tokens
  (`@felt-ui/react/styles.css`), and a shadcn-compatible registry under
  `registry/`.
- `"use client"` directives on interactive components for React Server
  Components / Next.js App Router compatibility.
- The `felt` CLI — `felt add <component>` wraps `shadcn` against the Felt
  registry.

[Unreleased]: https://github.com/owl-listener/felt-ui/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/owl-listener/felt-ui/releases/tag/v0.1.0
