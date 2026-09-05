# MCP Rack

A one-page board of every MCP server I have published, with its package, transport, licence and official-registry status, plus a hand-curated rack of servers built by other people that I run alongside mine.

It is a portfolio surface, not a directory. It links out to the repos and to the [official MCP Registry](https://registry.modelcontextprotocol.io); it does not try to index the ecosystem.

## Structure

```
index.html          the page
assets/styles.css   the look: warm black, bone type, one acid accent, split-flap reveals
assets/app.js       renders the board from the data file; filters, search, copy buttons, JSON-LD
data/servers.js     the only file you edit
.github/workflows/pages.yml   deploys to GitHub Pages on push to main
```

No framework, no build step, no tracker. Fonts come from Google Fonts (Fraunces and IBM Plex Mono) with local fallbacks.

## Editing the board

Everything on the page comes from `data/servers.js`, which sets `window.MCP_RACK`:

```js
window.MCP_RACK = {
  updated: "2026-09-05",
  owner: { name: "SarutobiSasuke8", url: "https://github.com/SarutobiSasuke8" },
  servers: [
    {
      name: "gimp-agent-mcp",
      tagline: "One line on what it does.",
      lang: "Python",                    // Python | TypeScript | Go (drives the filter chips)
      transport: "stdio",
      package: { kind: "pypi", name: "gimp-agent-mcp", version: "0.2.4" },   // or null
      registry: "io.github.SarutobiSasuke8/gimp-agent-mcp",                  // or null
      status: "beta",                    // beta | alpha | preview | experimental
      license: "Apache-2.0",
      repo: "https://github.com/SarutobiSasuke8/gimp-agent-mcp",
      install: "claude mcp add gimp -- uvx gimp-agent-mcp serve",           // optional; adds a copy button
      tags: ["gimp", "images"]           // optional; searched
    }
  ],
  rack: [
    { name: "GitHub MCP Server", by: "GitHub", kind: "official", blurb: "Why it earned its slot.", url: "https://github.com/github/github-mcp-server" }
  ]
};
```

Add a unit, bump `updated`, commit. The rack list is curated by hand and started as a seed: prune it to the servers you actually run.

## Running it

Open `index.html` in a browser, or serve the folder:

```bash
npx -y serve . -l 8123
```

## Deploying

1. Create a public repository (for example `mcp-rack`) and push this folder to `main`.
2. In the repository settings, Pages, set Source to GitHub Actions.
3. The included workflow deploys on every push to `main`.

A custom domain works the usual way: add a `CNAME` file and the DNS record.
