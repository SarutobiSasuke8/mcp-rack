/* The only file you edit. Every card on the board comes from here.
   Facts verified against GitHub, npm, PyPI and the official MCP Registry on 2026-09-05. */
window.MCP_RACK = {
  updated: "2026-09-05",
  owner: { name: "SarutobiSasuke8", url: "https://github.com/SarutobiSasuke8" },

  servers: [
    {
      name: "gimp-agent-mcp",
      tagline: "The whole of GIMP 3 for AI agents: every PDB procedure and GEGL filter, renders, pixel measurement, recipes. Windows-first.",
      lang: "Python",
      transport: "stdio",
      package: { kind: "pypi", name: "gimp-agent-mcp", version: "0.2.4" },
      registry: "io.github.SarutobiSasuke8/gimp-agent-mcp",
      status: "beta",
      license: "Apache-2.0",
      repo: "https://github.com/SarutobiSasuke8/gimp-agent-mcp",
      install: "claude mcp add gimp -- uvx gimp-agent-mcp serve",
      tags: ["gimp", "images", "gegl", "design", "windows"]
    },
    {
      name: "jobscout-mcp",
      tagline: "Privacy-first job discovery across sources: normalisation, deduplication and provenance for every listing.",
      lang: "TypeScript",
      transport: "stdio",
      package: { kind: "npm", name: "@sarutobi-sasuke/jobscout-mcp", version: "0.2.1" },
      registry: "io.github.SarutobiSasuke8/jobscout-mcp",
      status: "beta",
      license: "Apache-2.0",
      repo: "https://github.com/SarutobiSasuke8/jobscout-mcp",
      install: "claude mcp add jobscout -- npx -y @sarutobi-sasuke/jobscout-mcp",
      tags: ["jobs", "careers", "search"]
    },
    {
      name: "website-content-mcp",
      tagline: "A site-scoped content gateway: the pages, structure and text of a website in a form agents can reason over.",
      lang: "TypeScript",
      transport: "stdio",
      package: { kind: "npm", name: "@sarutobi-sasuke/website-content-mcp", version: "0.3.1" },
      registry: null,
      status: "beta",
      license: "MIT",
      repo: "https://github.com/SarutobiSasuke8/website-content-mcp",
      install: "claude mcp add website-content -- npx -y @sarutobi-sasuke/website-content-mcp",
      tags: ["web", "content", "seo", "sites"]
    },
    {
      name: "agent-handoff-mcp",
      tagline: "Local-first, bounded, auditable handoffs between AI agents. A coordination primitive, not a message bus.",
      lang: "TypeScript",
      transport: "stdio",
      package: null,
      registry: null,
      status: "alpha",
      license: "Apache-2.0",
      repo: "https://github.com/SarutobiSasuke8/agent-handoff-mcp",
      install: null,
      tags: ["agents", "coordination", "handoff"]
    },
    {
      name: "credential-broker-mcp",
      tagline: "Agents use gated APIs through scoped, audited requests without ever seeing the secret.",
      lang: "TypeScript",
      transport: "stdio",
      package: null,
      registry: null,
      status: "alpha",
      license: "Apache-2.0",
      repo: "https://github.com/SarutobiSasuke8/credential-broker-mcp",
      install: null,
      tags: ["security", "secrets", "credentials"]
    },
    {
      name: "obsidian-github-mcp",
      tagline: "Permissioned proposal gateway for Obsidian vaults stored on GitHub: agents propose, humans merge.",
      lang: "TypeScript",
      transport: "stdio",
      package: null,
      registry: null,
      status: "alpha",
      license: "Apache-2.0",
      repo: "https://github.com/SarutobiSasuke8/obsidian-github-mcp",
      install: null,
      tags: ["obsidian", "github", "knowledge", "vault"]
    },
    {
      name: "source-pack-mcp",
      tagline: "Structured research source packs: facts, quotes, numbers, primary links and a coverage map, with provenance.",
      lang: "TypeScript",
      transport: "stdio",
      package: null,
      registry: null,
      status: "alpha",
      license: "MIT",
      repo: "https://github.com/SarutobiSasuke8/source-pack-mcp",
      install: null,
      tags: ["research", "sources", "provenance"]
    },
    {
      name: "meeting-context-router",
      tagline: "Proposal-first routing from meeting tools into governed CRM and knowledge-system updates.",
      lang: "TypeScript",
      transport: "stdio",
      package: null,
      registry: null,
      status: "alpha",
      license: "Apache-2.0",
      repo: "https://github.com/SarutobiSasuke8/meeting-context-router",
      install: null,
      tags: ["meetings", "crm", "routing"]
    },
    {
      name: "mcp-dashboard",
      tagline: "Cost and benefit dashboard for your MCP toolbox across Claude Code, Codex, Gemini CLI and Cursor: RAM, context tokens, real usage, with working on/off switches.",
      lang: "Python",
      transport: "local web UI",
      package: { kind: "pypi", name: "mcp-dashboard", version: "1.0.0" },
      registry: null,
      status: "preview",
      license: "MIT",
      repo: "https://github.com/SarutobiSasuke8/mcp-dashboard",
      install: null,
      tags: ["observability", "tooling", "cost"]
    },
    {
      name: "sports-oracle-teneo-agent",
      tagline: "Teneo agent wrapping the Sports Oracle API: live NBA, NHL, MLB, NFL, F1, soccer, tennis and MMA data for agents.",
      lang: "Go",
      transport: "REST + MCP",
      package: null,
      registry: null,
      status: "experimental",
      license: "MIT",
      repo: "https://github.com/SarutobiSasuke8/sports-oracle-teneo-agent",
      install: null,
      tags: ["sports", "data", "teneo"]
    }
  ],

  /* Servers by other people that I run alongside mine: one card per server actually wired into my
     tools on the date above, nothing aspirational. Every URL checked on 2026-09-05. */
  rack: [
    { name: "Figma MCP Server", by: "Figma", kind: "official", blurb: "Design context, variables and screenshots straight from the file. Design to code in both directions.", url: "https://developers.figma.com/docs/figma-mcp-server/" },
    { name: "Notion MCP", by: "Notion", kind: "official", blurb: "Pages and databases as tools. Where durable notes go when they leave the chat.", url: "https://developers.notion.com/docs/mcp" },
    { name: "Canva MCP", by: "Canva", kind: "official", blurb: "Designs, brand templates and exports as tools. Social cards without opening the editor.", url: "https://www.canva.dev/docs/mcp/" },
    { name: "PixelLab MCP", by: "PixelLab", kind: "official", blurb: "Pixel-art characters, tilesets and animations generated as tools. Game assets without leaving the editor.", url: "https://github.com/pixellab-code/pixellab-mcp" },
    { name: "HubSpot MCP", by: "HubSpot", kind: "official", blurb: "CRM objects, campaigns and content analytics as tools. The sales side of the rack.", url: "https://developers.hubspot.com/mcp" },
    { name: "Asana MCP", by: "Asana", kind: "official", blurb: "Projects and tasks as tools, so status updates write themselves.", url: "https://developers.asana.com/docs/using-asanas-model-control-protocol-mcp-server" },
    { name: "Fireflies MCP", by: "Fireflies.ai", kind: "official", blurb: "Meeting transcripts, summaries and action items as tools. Every call becomes searchable context.", url: "https://docs.fireflies.ai/getting-started/mcp-configuration" },
    { name: "TinyFish", by: "TinyFish", kind: "official", blurb: "Web search, page fetch and browser automation for agents. The eyes on the open web.", url: "https://docs.tinyfish.ai/" }
  ]
};
