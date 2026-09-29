---
title: "gimp-agent-mcp 0.5: one undo step, three platforms"
description: "Everyday adjust, canvas and draw tools, a whole turn of edits behind one Ctrl+Z, and live GIMP checks on Windows, Linux and macOS."
pubDate: 2026-09-08
category: Release notes
server: gimp-agent-mcp
version: "0.5.0"
---

The rack was still listing 0.3.0. PyPI has been on 0.5.0 since 8 September. This note catches the board up.

## What changed after 0.3

0.3 shipped bundled skills and a Claude Code plugin. 0.4 and 0.5 are the releases that make an agent safer to leave in a real document.

- **One undo step.** `gimp_edit_batch` puts up to 100 supported edits on one image into a single GIMP undo group. A failed step stops the batch and reports what already landed. It does not keep a transaction open between separate agent calls, and it does not invent a programmatic undo.
- **The document you mean.** `gimp_context` reads and sets the selected layers and selection bounds, and can bring a named document forward. It refuses to guess which image has keyboard focus from list order.
- **Everyday edits without a discovery call.** `gimp_adjust`, `gimp_canvas` and `gimp_draw` cover 23 common actions. Each result names the GEGL or PDB operation it actually ran.
- **Sprite sheets that check their own pixels.** `sprite_sheet_pack` writes a grid PNG, a layered XCF and atlas JSON, then reopens the PNG and compares every cell.
- **Diagnostic renders.** Grids, layer boxes, selection bounds and labelled points are drawn on a temporary duplicate. The working image stays clean.

## Where it was proven

Live GIMP runs on Windows 3.2.4, Linux 3.2.2, and macOS 15 GIMP 3.2.4 on Apple Silicon and Intel. A release waits for all three. The earlier line, Windows first and other platforms not exercised, is no longer true.

## Install

```bash
claude mcp add gimp -- uvx gimp-agent-mcp serve
uvx gimp-agent-mcp install-plugin
uvx gimp-agent-mcp install-skills
```

Restart GIMP and choose Filters, Development, Start Agent Bridge.

## Still open

Long filters are still synchronous. There is no mid-filter cancel or progress report. Sprite packing still requires equal-sized PNGs. Vector warp is not claimed.
