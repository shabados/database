# Giaan Khand Search Port Plan

This is the approved implementation plan used for the search-first port to the product stack.

## Summary

- Create a new `pnpm` workspace around the current repo and introduce `apps/web` for the frontend, `apps/api` for the public API, `packages/contracts` for shared `Zod` schemas/OpenAPI, `packages/sdk` for the generated typed client, and `packages/search-core` for query normalization and initials mapping.
- Treat the current static UI in `app/public` as the visual and interaction reference only. Rebuild it as React + TypeScript components in `Next.js` App Router. Do not keep the HTML/CSS/JS app as the product surface.
- Ship a search-first v1: homepage, global pangti search across all granths, search results with granth/location context, and granth detail pages. Do not include the full reader in this first cut.
- Move API reads to PostgreSQL now. Keep the existing archive SQLite build pipeline as the source ingest input, and add an importer that materializes the product read model into Postgres plus a derived Typesense search index.
- Support two input modes in v1: direct Gurmukhi queries and Latin initials mapped to Gurmukhi initials. Do not implement full Latin phonetic transliteration search in this cut.

## Implementation Changes

- Workspace and runtime:
  - Add `pnpm-workspace.yaml` and convert new app/API work to `Node 22 + pnpm`.
  - Keep existing Bun/archive tooling untouched and isolated from the new app/API runtime.
  - Use plain React components plus CSS Modules and one shared global tokens stylesheet for the web app. Do not introduce Tailwind for this port.
- Web app:
  - Build `apps/web` with Next.js App Router.
  - Port the current search-first UI into React components: hero/search shell, quick links, search results list, empty/loading states, and granth detail surface.
  - Use shareable URLs: `/` for the home/search shell, `/search?q=...` for results, and `/works/[slug]` for granth detail pages with optional query params to preserve search context.
  - Keep public pages SSR-friendly; server-render the shell and hydrate the interactive search UI client-side.
- API and contracts:
  - Build `apps/api` with Fastify as the only shared/public JSON API.
  - Define request/response contracts in `packages/contracts` and generate OpenAPI plus a typed SDK in `packages/sdk`.
  - Keep search endpoints out of Next route handlers; the web app must consume the Fastify API through the generated client.
- Postgres read model and import:
  - Add a product read model in Postgres for `works`, `structure_nodes`, `passages`, and `passage_texts`, limited to the fields needed for search, granth pages, and result context.
  - Add an idempotent import command that reads from the built archive SQLite database and upserts the Postgres read model.
  - Store enough lineage in Postgres to preserve stable IDs/slugs, work relationships, structure hierarchy, page/unit metadata, and the original Gurmukhi body text.
- Search engine and normalization:
  - Use Typesense as the v1 search engine.
  - Add an indexing command that reads from Postgres and writes a `pangtis` index containing at least: passage ID, work slug/title, structure node slug/title, original Gurmukhi text, normalized Gurmukhi text, extracted initials sequence, Latin-initial lookup keys, page or locator metadata, and ranking fields.
  - Put all query parsing and initials logic in `packages/search-core`.
  - Implement v1 normalization rules explicitly:
    - Normalize Gurmukhi punctuation and spacing before initials extraction.
    - Extract initials from the original Gurmukhi pangti by word, skipping punctuation-only tokens.
    - Accept direct Gurmukhi query text as-is after normalization.
    - Accept Latin input as initials only, map each Latin key to one or more allowed Gurmukhi initials, and search against the precomputed initials field.
    - Do not attempt full phonetic transliteration or full Latin text matching in v1.

## Public Interfaces

- `GET /v1/search/pangtis?q=...&work=...&cursor=...&limit=...` returns `{ items, nextCursor, queryMeta }`.
- `PangtiSearchItem` includes `passageId`, `workSlug`, `workTitle`, `structureLabel`, `locatorLabel`, `originalText`, `matchedBy`, `matchedInitials`, and `score`.
- `GET /v1/works` returns curated or searchable work summaries for homepage quick links and browse surfaces.
- `GET /v1/works/:slug` returns work metadata plus top-level structure summaries used by the granth detail page.
- `GET /v1/passages/:id` returns one passage with its immediate context metadata for result expansion and deep-linking from search results.
- `packages/contracts` defines the exact query/response schemas for these endpoints and is the single source of truth for OpenAPI and SDK generation.

## Test Plan

- Unit-test `packages/search-core` for Gurmukhi normalization, initials extraction, Latin-to-Gurmukhi initials mapping, punctuation handling, and query-mode detection.
- Add fixture tests proving that a direct Gurmukhi query and its Latin-initial equivalent hit the same pangti set for representative passages.
- Add importer tests proving stable IDs/slugs and hierarchy are preserved from SQLite into Postgres.
- Add indexer tests proving indexed documents contain the expected search fields and ranking inputs.
- Add Fastify integration tests for all v1 endpoints, including pagination, work filtering, empty results, unknown work slugs, and passage lookup failures.
- Add web tests for homepage rendering, search-state URL sync, result rendering, empty/loading states, and navigation into `/works/[slug]`.
- Add at least one end-to-end flow covering: load homepage, search by Latin initials, view global results across multiple granths, open a granth detail page, and return to the same search context.

## Assumptions and Defaults

- `Typesense` is the chosen search engine for v1.
- The existing archive SQLite build remains the ingest source, but the new API runtime reads from Postgres, not SQLite.
- v1 supports direct Gurmukhi search and Latin initials mapped to Gurmukhi initials only; full phonetic Latin transliteration search is explicitly out of scope.
- v1 frontend scope is search/discovery only: no full reader, annotation, or authenticated flows.
- The current static app remains only as a temporary reference during migration and is removed from the critical product path once the new web/API stack reaches feature parity.
