---
title: "lmms-mcp 0.10: a church for the piano"
description: "A convolution reverb for rooms, halls, churches and cathedrals, measured against the dry sound, and the Salamander Grand as the default sampled piano."
pubDate: 2026-11-15
category: Release notes
server: lmms-mcp
version: "0.10.0"
draft: true
---

<!--
DRAFT. Do not set draft to false until v0.10.0 is tagged and `npm view @sarutobi-sasuke/lmms-mcp version` returns 0.10.0.
Before publishing, re-check against the tagged CHANGELOG.md and docs/midi-import.md:
- the space presets table and the wetDb wording (claude/space-reverb branch, not merged when this was written)
- how the Salamander Grand becomes the default piano (not in code when this was written; in 0.9.1 setup-libraries-windows.ps1 still fetches the Splendid Grand). Add how to fetch it once that is settled.
- any other entries in the 0.10.0 changelog section (open PRs 30 and 31 may land first)
- pubDate, the release job's test and tool counts, and the npm version on the listing in servers.json
-->

0.9 could render a whole piano piece from a score, but the room around it was Pedalboard's algorithmic reverb, which is fine for a short tail and grainy for a long one. 0.10.0 adds a convolution reverb with 4 sizes of space, and makes the Salamander Grand the default sampled piano.

## The `space` reverb

`render_vst3_stems` takes a `space` for each track. It convolves the track with a synthetic stereo impulse response: sparse early reflections, then a dense tail whose highs die faster than its lows. The impulse is generated from a fixed seed, so no third-party impulse response ships or needs a licence.

| type | Decay | Pre-delay | Character |
| --- | --- | --- | --- |
| room | 0.9 s | 6 ms | Close and dry |
| hall | 2.4 s | 22 ms | Concert hall |
| church | 4.2 s | 30 ms | Stone, darker, long |
| cathedral | 7 s | 45 ms | Very long and distant |

```json
"space": { "type": "church", "wetDb": -10 }
```

`wetDb` is the level of the space against the dry sound, and it is measured. The tool scales the wet signal so its RMS sits that many decibels below the dry signal's, so -10 means the same thing in a room and in a cathedral: -14 is subtle, -10 spacious and -6 distant. That came out of the first test, where a church at an unmeasured -8 dB made a soft piano 5 dB louder and nearly cancelled in mono. `width` (default 0.6) narrows the tail for the same reason. `seconds`, `predelayMs` and `brightness` override the preset. Use `space` or `reverb` on a track, not both, and add the decay time to `durationSeconds` so the tail is kept.

## The Salamander Grand

The Salamander Grand Piano by Alexander Holm is an open SFZ library with 16 velocity layers. Since 0.9.1, `convert_sfz` converts it with all of them. In 0.10.0 it is the default sampled piano, in place of the public-domain Splendid Grand with its 4 layers. The samples are CC-BY 3.0, so credit Alexander Holm wherever a render is used. No samples ship in the package.

## Worked example: Gymnopédie No. 1 in a church

The same public-domain Mutopia score as in the [0.9 notes](../lmms-mcp-0-9/): imported at 66 BPM, unfolded to 78 bars, shaped, exported as MIDI and rendered through Decent Sampler on the Salamander Grand with `width` 0.55, 3 EQ bands and a church at -10 dB, then mastered to -18 LUFS.

| Render | Length | Integrated | Loudness range |
| --- | --- | --- | --- |
| Salamander, light room reverb | 219.4 s | -18.1 LUFS | 4.7 LU |
| Salamander, church | 222.8 s | -18.1 LUFS | 4.9 LU |

The church render was given 228 seconds against 224 for the room version, for the 4.2-second tail, and the master trimmed it to 222.8. The true peak of the church version is -0.9 dBFS.

## What is not tested

- The space reverb runs in the Python render step after the instrument and the EQ, so it applies to the VST3 and sampler route only, which is tested on Windows x64 only.
- The decay times are the preset targets of the synthetic impulse. They are not measured RT60 values of real buildings.
- Stock LMMS 1.2.2 on Windows x64 and Linux in CI, as before. macOS is not tested.
- The server is still not in the official MCP Registry, and it stays at alpha.

The full changelog is in [CHANGELOG.md](https://github.com/SarutobiSasuke8/lmms-mcp/blob/v0.10.0/CHANGELOG.md).
