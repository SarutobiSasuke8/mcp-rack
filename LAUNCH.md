# Launch MCP Rack to mcprack.dev

The production defaults are https://mcprack.dev and a root base path. Empty Actions variables fall back correctly. Directory output supports nested routes on GitHub Pages.

## Before publishing
- Run npm run verify.
- Review the working diff, including the pre-existing Astro migration and this sweep.
- Review journal copy, listing standards, privacy explanation and maker suggestions.
- Confirm current versions and curated links against upstream documentation.
- Confirm public issues are enabled for suggestions.
- Confirm ownership of mcprack.dev and configure GitHub Pages custom domain and DNS using https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site
- Set repository variables SITE_URL=https://mcprack.dev and SITE_BASE=/, or leave both unset for defaults. Replace any legacy values.
- Configure mcprack.dev in Pages and enforce HTTPS once the certificate is issued.
- Push the reviewed changes when launch is authorized. A push to main deploys automatically.

DNS, domain settings and publishing are not performed by this local sweep.

## After publishing
Verify HTTPS, canonical URLs, mobile navigation, search, copy controls, a nested server route, a journal article, 404, social images, robots.txt, sitemap, RSS, catalog.json, catalog.schema.json, llms.txt, llms-full.txt and individual .md documents on the real domain.

## Editorial operation
Articles: src/content/posts. Categories: Guides, Perspective, Field notes, Build log, Release notes. draft: true excludes a post from public HTML, RSS, catalog, Markdown and full-text exports.
Own projects: src/content/servers.json. Curated picks: src/content/rack.json.
No paid placement or checkout is active. Suggestions prepare a public GitHub issue and do not submit automatically.

## Artwork
public/rack-hero.webp is a 1536px optimized imagegen derivative. Built-in tool prompt: premium developer website hero for MCP Rack; three stacked graphite anodized-aluminium modules, restrained teal indicator lights, brushed silver and smoked glass; dark studio, object right, empty left; no text, logos or people. Original preserved in the imagegen output directory.

## 2026-09-07 branding and readiness pass
- Rack R identity, matching favicon, Apple touch icon, avatar and social artwork are implemented. See BRAND.md.
- Client logos are locally served SVG files with license and attribution in public/clients. A copy-prompt fallback avoids depending on client-specific URL behavior.
- npm run build now checks generated pages, internal references, catalog entries, Markdown documents, JSON-LD, social images, client assets and sitemap before succeeding.
- Domain recommendation: mcprack.dev as the primary identity for an independent curated collection; a personal subdomain is sufficient if it remains only a portfolio section. No purchase has been performed. Check the renewal price as well as the introductory price.
- .dev requires working HTTPS because it is HSTS-preloaded: https://www.registry.google/domains/dev/
- Remaining launch actions: domain registration/ownership, DNS, Pages domain and repository variables, certificate provisioning, approved push, and a final check on the real domain.
