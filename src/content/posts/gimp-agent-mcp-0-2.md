---
title: "gimp-agent-mcp 0.2: the whole of GIMP 3, for AI agents"
description: "Every PDB procedure and GEGL filter, a render after each step, pixel measurement, and the colour bug that shipped in 0.2.0 and got fixed the same day."
pubDate: 2026-09-05
category: Release notes
server: gimp-agent-mcp
version: "0.2.4"
---

Every colour the agent asked for came out lighter than it asked. `#2b2f5a` rendered as `#7277a0`. The agent could not tell, because until 0.2 it had no way to read a pixel back. That bug, and the fact that the tool could now catch it, is the whole point of this release.

## What it is

gimp-agent-mcp is an MCP server that hands an AI agent the whole of GIMP 3 rather than a hand-picked slice. GIMP's Procedure Database has roughly 1,000 procedures and GEGL has 207 filters. Instead of wrapping a few dozen by hand, the server reads them from GIMP at call time: `gimp_pdb_search`, `gimp_pdb_describe`, `gimp_pdb_call`, and the same three verbs for filters. Argument types, enum choices and defaults come from the running GIMP, so nothing goes stale when GIMP updates.

It runs on Windows first, because CPython on Windows has no Unix sockets and every earlier GIMP server assumed it did. The bridge is a GIMP plug-in listening on loopback TCP with a per-install token. macOS and Linux paths are implemented but not yet exercised on real machines.

## What 0.2 added

0.1 could open, edit and export. 0.2 is the detailed-work release:

- **Sight.** `gimp_render` returns a PNG of the current state: the whole image, one layer, or a region at full resolution. `gimp_snapshot` and `gimp_render_compare` give before, after and a pixel diff side by side.
- **Measurement.** `gimp_measure` reads the colour at a point, the bounding box of visible pixels, a per-channel histogram and the dominant colours. The agent stops guessing from a downscaled render.
- **Selections and masks.** Rectangle, ellipse, by colour, by alpha, from a path, grow, shrink, feather, border. Layer masks from any of those, plus raw mask pixel writes.
- **Text and paths.** Text layers with real fonts, and vector paths that can be stroked, filled or turned into selections.
- **Non-destructive effects.** GEGL filters can be appended as GIMP 3 layer effects and edited afterwards with `gimp_layer_effect`.
- **AI cut-outs.** `gimp_remove_background` runs a segmentation model and writes the result back as an editable layer mask.
- **Recipes.** Repeatable jobs written once as Python that runs inside GIMP: Telegram stickers, web-optimised exports to a size budget, icon sets, watermarks, contact sheets, sprite-sheet slicing, and `compose`, which builds a card or banner from a layout manifest. `gimp_batch_recipe` runs one over a folder.

33 tools and 8 recipes in total. A CI job installs the real GIMP 3.2.4 on a Windows runner and runs 23 live checks on every push.

## The bug

The repo banner was built through the bridge itself, and it came out wrong. GEGL's `Color.set_rgba` takes linear RGB, and the server was passing sRGB hex values straight in. Every colour rendered lighter than asked. 0.2.1 routes colours through GEGL's sRGB string parser and converts reported colours back; the smoke test now asserts an exact `#2b2f5a` round trip.

Two lessons. The product's own output is the best test fixture. And an agent that can measure a pixel finds this class of bug in one call, where an agent that only sees a render does not find it at all.

## 0.2.2 to 0.2.4, same day

- `gimp_help(topic)`: in-band documentation with worked examples, because tool descriptions say what a tool does and not how to combine six of them.
- The bridge serves several clients at once with no threads in the plug-in process. Threads inside GIMP crashed PyGObject intermittently; sockets are now served by GLib IO watches on the plug-in's main loop.
- Agents work in the GIMP window you already have open: **Filters, Development, Start Agent Bridge**. Every agent edit lands in your layer stack as an undoable step.
- 0.2.4 publishes the server to the official MCP Registry from the release workflow, with GitHub OIDC and no stored secrets.

## Install

```bash
claude mcp add gimp -- uvx gimp-agent-mcp serve
```

Then `uv run gimp-agent-mcp install-plugin` once, restart GIMP, and start the bridge from the Filters menu or let the agent launch a headless instance. Requires GIMP 3.0 or newer and Python 3.11+.

## What is next

0.3 is macOS and Linux verification (native, Flatpak, Snap), layer-effect reordering, guided mask refinement, a render overlay that draws selection bounds and measurement points so the agent can see coordinates, and recipe parameters exposed as JSON Schema so clients can render forms. The roadmap is in the repository.
