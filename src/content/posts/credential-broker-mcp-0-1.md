---
title: "credential-broker-mcp 0.1: take the keys out of your .env files"
description: "The credential broker is on npm and in the MCP Registry. Agents call gated APIs through the broker and never hold the key."
pubDate: 2026-11-07
category: Release notes
server: credential-broker-mcp
version: "0.1.1"
---

Every coding project with an API in it starts the same way. You find the key, paste it into a `.env` file, add the file to `.gitignore` and hope nothing copies it anywhere else. Now there is also an AI agent working in that folder, and it can read the file as easily as you can.

credential-broker-mcp is now on npm as 0.1.1, published from GitHub Actions with provenance, and listed in the official MCP Registry as `io.github.SarutobiSasuke8/credential-broker-mcp`.

## How it works

The key goes into your operating system's keychain: Windows Credential Manager, the macOS login keychain or the Secret Service on Linux. The agent never gets it. When the agent needs an API, it asks the broker to make the request. The broker checks the policy for that agent and that operation, adds the key at the last moment, makes the call, strips the key out of the response in every encoding it creates, and writes an audit line with who asked for what and the outcome. The audit line never holds the content.

- **Grants per agent and per operation.** One agent can read a repository while another can open issues. A write can require an approval before it runs.
- **A local key manager page.** Add a key, tick the agents that may use it and press Test. It can also find keys already sitting in your environment variables, MCP client configs and `.env` files and import them, without the values reaching the page.
- **A pause button.** One press cuts every agent off until you resume, and the refusal tells the agent not to retry.

## Install

```bash
npx -y -p @sarutobi-sasuke/credential-broker-mcp credential-broker-keys
```

The page prints a link and opens it in your browser. Add a key, then use *Connect to Claude Code* (or the Codex block) to register the server. Under `npx`, the policy, audit log and approvals live in `~/.credential-broker`, which is the 0.1.1 fix: 0.1.0 kept them in npm's cache.

## Still open

This is an early release. The policy format may change before 1.0. An upstream that transforms a key with its own one-way function defeats string matching; scoped operations and metadata-only responses are the defence there, and [SECURITY.md](https://github.com/SarutobiSasuke8/credential-broker-mcp/blob/main/SECURITY.md) states that limit. The listing stays at alpha until it has a recorded workflow in 2 clients and a promotion receipt.
