---
title: "Job discovery without a private profile"
description: "A public MCP server can help an agent find work without becoming a repository for someone’s CV, preferences or applications."
pubDate: 2026-09-07
category: Field notes
server: jobscout-mcp
ogImage: /og/post-jobscout-discovery-without-a-private-profile.png
---

I built JobScout around a simple boundary: job listings are public, but the decision about someone’s next role is personal. An agent can help find, normalise and preserve the source of a role. It does not need a CV, a ranking profile or permission to apply.

That is the boundary behind [JobScout MCP](/servers/jobscout-mcp/). The server gives an agent a structured pool of listings from several sources, removes duplicates and keeps provenance attached. It deliberately stops before deciding whether a role is right for someone.

## Keep the public part narrow

An agent can ask JobScout for terms, locations and recency on each call. The server can return the titles, companies, source links and classification signals it sees. Those are useful shared capabilities.

The private layer is different. Someone’s experience, salary expectations, appetite for relocation and judgement about a role should remain with them or in their own controlled workflow. That is better for privacy, but it also makes the public service easier to understand.

It also keeps a clear human decision point. Finding a lead is not the same as applying, contacting an employer or representing a candidate.

## Read the full launch note

The original launch note explains the design, the CI-enforced boundary and the early workflow in more depth: [I Open-Sourced an MCP Server for Job Discovery](https://alexeiudall.com/writing/jobscout-mcp-job-discovery-for-ai-agents).

For current install details and project status, use the [JobScout MCP listing](/servers/jobscout-mcp/).
