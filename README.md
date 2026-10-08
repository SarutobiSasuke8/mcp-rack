# MCP Rack

Live at https://mcprack.dev/

One page for every MCP server I have published, with its package, transport, licence and official-registry status; a curated rack of the servers I run alongside them; and release notes written here first.

It is a portfolio surface, not a directory. It links out to the repositories and to the [official MCP Registry](https://registry.modelcontextprotocol.io) rather than trying to index everything.

## Stack

Astro 7, static output, no client framework, no tracking. Geist and Geist Mono self-hosted through Fontsource. Content collections for servers, the rack and posts. RSS, sitemap, `llms.txt`, `servers.json` and JSON-LD on every page. Deployed to GitHub Pages by the workflow in `.github/workflows/pages.yml`.

```
src/content/servers.json     the board: one object per published server
src/content/rack.json        the rack: one card per server actually in use
src/content/posts/*.md       release notes, field notes, build logs
src/lib/site.ts              names, links, base-path helper
src/components/              Header, Footer, ServerRow, RackCard, PostCard, ShareLinks
src/layouts/                 BaseLayout (head, SEO, theme, scripts), PostLayout
src/pages/                   routes, plus rss.xml, servers.json and llms.txt endpoints
scripts/check-style.mjs      the style gate: em dashes and marketing filler fail the build
scripts/generate-og.mjs      Open Graph images, generated before each build
```

## Working on it

```bash
npm install
npm run dev        # http://localhost:4321/mcp-rack
npm run verify     # style gate, type check, build
```

### Add a server

Add an object to `src/content/servers.json`. The schema in `src/content.config.ts` is the contract: `slug`, `name`, `tagline` (under 180 characters), `summary`, `highlights`, `lang`, `transport`, `package` (or `null`), `registry` (or `null`), `status`, `license`, `repo`, `docs`, `install` (or `null`), `tags`, `order`, and optionally `hosted`. The server page, the board row, the footer link, the OG image, `servers.json` and `llms.txt` all follow from it.

### Hosted endpoints

A listing may carry an optional `hosted` object: `{ "url": "https://...", "label": "...", "kind": "remote-mcp" | "demo", "live": false }`. While `live` is false the server page and `/hosted` say "coming soon" and do not link the URL; `catalog.json`, `servers.json`, `llms.txt` and the Markdown page say the same. Flip `live` to `true` once the endpoint answers and the page shows a "Use it hosted" action. `/hosted` lists hosted products only. There is no checkout or pricing on the site. Catalogue schema 1.2.0 adds `hosted` (null when absent) as an additive field; consumers that pin 1.1.0 must update their validator.

### Write a release note

Create `src/content/posts/<slug>.md` with frontmatter:

```yaml
title: "gimp-agent-mcp 0.5: one undo step, three platforms"
description: "One or two sentences. Under 200 characters."
pubDate: 2026-09-08
category: Release notes        # Release notes | Field notes | Build log | Guides | Perspective
server: gimp-agent-mcp         # optional; links the post to its server page
version: "0.5.0"               # optional
```

Reading time is computed from the body. Setting `draft: true` keeps a post out of the build.

### Maturity and review evidence

`status` supports experimental, alpha, preview, beta and stable. Review metadata is separate from the build timestamp: set `reviewedAt` (YYYY-MM-DD) together with `review` (`kind`, `summary`, `evidence` URLs), or leave both null. Metadata reviews check documentation and releases; runtime reviews name actual checks and environments.

Stable requires a runtime review, `supportedScope` and a `maturityEvidence` URL pointing to a completed [promotion receipt](docs/PROMOTION_RECEIPT.md). The content validator rejects incomplete promotions. Existing beta labels remain maintainer snapshots until their evidence is reassessed. Catalogue schema 1.1.0 adds these fields and the stable enum; consumers that pin 1.0.0 must update their validator.

Curated records have their own `selectionBasis`. Leave their review date unset until a real review takes place.

### Curated records

One card per server actually wired into my tools. Add a card to `src/content/rack.json` when a server earns its slot; remove it when it stops being used.

## Deploying

Push to `main`. The workflow runs the style gate, the type check and the build, then publishes `dist/` to GitHub Pages.

To serve from a custom domain, set two repository variables (`Settings`, `Secrets and variables`, `Actions`, `Variables`): `SITE_URL` to the origin (for example `https://mcp.alexeiudall.com`) and `SITE_BASE` to `/`. Add the domain under `Settings`, `Pages`, and a `CNAME` DNS record pointing at `sarutobisasuke8.github.io`.

## Licence, content and brand

Source code is MIT licensed. See [LICENSE](LICENSE).

The MCP Rack name, Rack R symbol and associated brand assets are reserved. See [TRADEMARKS.md](TRADEMARKS.md). Articles, editorial copy, curated selections and original visual assets have separate reuse terms in [CONTENT-LICENSE.md](CONTENT-LICENSE.md).


## 2026-09-07 website sweep

The current site adds curated positioning, a journal with topic filters, maker suggestions, listing standards, and agent interfaces. Production defaults target **https://mcprack.dev/**. Earlier GitHub Pages URL and subpath instructions above describe the previous deployment. Follow [LAUNCH.md](LAUNCH.md) for the current launch checklist. The custom domain is live: https://sarutobisasuke8.github.io/mcp-rack/ redirects to https://mcprack.dev/.

Machine interfaces: /catalog.json, /catalog.schema.json, /servers.json, /llms.txt, /llms-full.txt, /servers/{slug}.md, /blog/{slug}.md, and /rss.xml. Metadata comes from the same collections as HTML pages. Build timestamps are not review dates. New journal categories include Guides and Perspective. Draft articles are excluded from public endpoints.
