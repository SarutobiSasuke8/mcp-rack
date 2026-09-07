---
title: "MCP Rack: one page for every server I have shipped"
description: "Why the servers needed a home of their own, what the site does that the registries do not, and the rule that keeps the rack short."
pubDate: 2026-09-05
category: Build log
---

Ten MCP servers, two package registries, one official registry, and no single place that said what each one was for. Searching my own handle on GitHub returned the list without the context. That is the gap this site closes.

## What is here

Every server I have published has a page: the package and version, the transport, the licence, whether it is in the official MCP Registry, and a one-line install for Claude Code that any stdio client can reuse. The board on the front page is sortable and searchable. Release notes are written here first and go out on the RSS feed.

The rack is the short list of servers built by other people that I run alongside mine. One card each, with what I use it for. A server gets a card by being wired into my tools; it loses the card when it stops being used. Eight today.

## What is not here

A directory. The official MCP Registry is the authority for what exists, and the aggregators that read it (Glama, PulseMCP, mcp.so, LobeHub) already compete on coverage. Publishing to the registry is the discoverability move that matters; a curated page on top of it is worth more than a bigger list.

## For agents

The same facts are machine-readable. `servers.json` carries the board with install commands. `llms.txt` summarises the site. Every page has structured data. If an assistant is asked what I have published, it has a source to cite.

## How it is built

Astro, static, no client framework, no tracking. Fonts are self-hosted. The build fails on em dashes and marketing filler, the same gate astraeus.ie runs. Source is on GitHub under MIT, and the next release note will be the next time a server changes.
