---
title: "lmms-mcp 0.9: from a MIDI score to a mastered piano render"
description: "LMMS MCP is on npm. 0.9 adds MIDI import, performance shaping and mastering, whole-piece composing, DJ effects, and a sound library with tags."
pubDate: 2026-11-15
category: Release notes
server: lmms-mcp
version: "0.9.1"
---

The rack was still listing LMMS MCP 0.7.0, installed from a GitHub tarball. The server is now on npm as `@sarutobi-sasuke/lmms-mcp`, published from GitHub Actions with provenance. 0.9.0 and 0.9.1 both came out on 15 November 2026. This note catches the board up.

LMMS MCP lets an AI agent write, mix and render music with stock LMMS 1.2.2, mainly for games. The agent writes a normal LMMS project that you can open and edit, renders it without opening the editor, and measures the result. It cannot hear, so it checks loudness, peaks and loop seams in numbers instead.

## Install

```bash
npx -y @sarutobi-sasuke/lmms-mcp
```

Run it over stdio with `LMMS_WORKSPACE` set to a folder for projects and renders, and install LMMS separately. In Claude Code:

```bash
claude mcp add lmms -e LMMS_WORKSPACE=/path/to/workspace -- npx -y @sarutobi-sasuke/lmms-mcp
```

Long renders can take a minute or more, so give your client a tool timeout of at least 5 minutes. 0.9.1 lowered the Node.js requirement to 20. Under 0.9.0 the `engines` field asked for 22, and on Node.js 20 npm picked the empty `0.0.0` placeholder instead and failed with "could not determine executable to run".

## What 0.9.0 added

No tool was renamed and no required argument changed from 0.8.1.

- **MIDI scores.** `import_midi` turns a standard MIDI file into an editable LMMS project. It keeps the time signature and tempo, bakes the sustain pedal into note lengths, folds channel volume and expression into velocities, merges tracks onto one instrument, and takes a `form` to unfold repeats that notation programs export only once.
- **Performance shaping.** `shape_performance` makes a typed-in score sound played: phrase dynamics that rise to a peak 60% of the way through each phrase, a louder top voice, a small accent on the first beat, ritardando at phrase ends and in the final bars, a simulated sustain pedal and a 1-tick melody lead. Every effect has a strength, and the same `seed` gives the same result.
- **Mastering.** `master_audio` trims the silence at the end of any workspace WAV, fades it and brings it to a loudness target.
- **Sampled instrument rendering.** `render_vst3_stems` now renders up to 600 seconds and takes an optional `width`, `eq` (up to 6 bands) and `reverb` for each track.
- **Whole pieces.** `compose_piece` and `compose_batch` write an arranged piece from a style and a seed, render it and rank the takes by measured checks. 5 starter styles: chiptune, adventure, battle, ballad and swing. `lmms-compose` does the same on the command line with no agent.
- **Writing tools.** `write_melody`, `write_accompaniment` and `write_solo`, plus a phrase library of 68 progressions, bass lines, hooks and grooves that fit any key.
- **DJ effects.** `dj_effects` applies filter sweeps, beat repeats, tape stops, spinbacks, echo outs and more to a rendered WAV at bar positions, and `rearrange_audio` re-orders a render by bar ranges.
- **A sound library page.** `build_library_page` writes one HTML page with every factory preset, stock sample, workspace sound and library phrase, with filters and audio previews.

## What 0.9.1 added

Again no tool changes.

- `tag_sound` and `list_tagged` keep metadata for workspace sounds and finished pieces (title, composer, era, genre, mood, game use, licence, credits and more) in a `<name>.meta.json` file next to the sound. The library page adds filters for those fields and shows the credits.
- `build_timeline_page` shows a song as a DAW would, with each stem as a lane under a bar ruler and synced playback with mute and solo.
- `compose_piece` now plans a form: theme, contrast, a solo that opens by quoting the theme, a varied return and an ending.
- `convert_sfz` follows `#include` written in the middle of a line, so the Salamander Grand Piano converts with all 16 velocity layers instead of 1.
- Decent Sampler renders wait for the samples to load, so the start of a render with a large library is no longer silent.

## Worked example: Satie, Gymnopédie No. 1

The test piece for the MIDI tools is Satie's Gymnopédie No. 1 (1888) from the [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=37). The edition was typeset by Evin Robertson from the Dover edition and placed in the public domain, so both the composition and the file are free to use. The MIDI plays the repeat once, which gives 47 bars.

1. `import_midi` at 66 BPM with both hands merged onto one piano and `form` set to bars 1 to 31, 32 to 39, 1 to 31 and 40 to 47. That unfolds the piece to its full 78 bars.
2. `shape_performance` with the score's phrase lengths and `pedal: "bar"`.
3. `export_midi`, then `render_vst3_stems` with Decent Sampler and a converted piano preset, `width` 0.55, 3 EQ bands and a light reverb.
4. `master_audio` on the mix to -18 LUFS.

The shaped render runs 219.1 seconds against 216.0 seconds for the same import with no shaping. Rubato and the final ritardando add about 3 seconds. Both measure -18.0 LUFS integrated. Width mattered more than expected: the Splendid Grand samples are wide, and at full width the mix measured a stereo correlation of 0.13 and thinned out in mono. At 0.55 it measured 0.58. The full request is in [docs/midi-import.md](https://github.com/SarutobiSasuke8/lmms-mcp/blob/v0.9.1/docs/midi-import.md).

## Tests and what is not tested

The 0.9.1 release job ran 226 unit tests with 0 failures, started the server and listed 82 tools, and checked that the package holds no audio, tests or private files before publishing. CI renders with LMMS on Windows and on Linux with the LMMS AppImage.

- Tested with stock LMMS 1.2.2 on Windows x64. macOS is not tested.
- The VST3 and sampler route (Decent Sampler 1.42.1, Surge XT, Python 3.12) is tested on Windows x64 only. No samples ship in the package; a setup script fetches open libraries, and some need attribution.
- The MIDI import keeps one time signature and one tempo per project, and only the sustain pedal, channel volume and expression controllers.
- The server is not in the official MCP Registry yet.

It stays at alpha. The [changelog](https://github.com/SarutobiSasuke8/lmms-mcp/blob/v0.9.1/CHANGELOG.md) lists every change that can affect a saved workflow.
