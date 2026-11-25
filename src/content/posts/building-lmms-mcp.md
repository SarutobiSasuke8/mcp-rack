---
title: "Building LMMS MCP: a music studio an AI agent can use but cannot hear"
description: "What went into LMMS MCP in its first two days: composing inputs an agent can write, a measured sound catalogue, a mixer, listening by numbers, game-ready exports, and the tools added after."
pubDate: 2026-11-16
category: Build log
server: lmms-mcp
---

I like Suno. But my plan has a monthly download cap, and game music needs a lot of finished files: loops, variations, layers that fade in and out, short stingers for a win or a death. That adds up fast.

So I built LMMS MCP with Claude and Codex. It is a free, MIT-licensed MCP server that lets an AI agent write music in [LMMS](https://lmms.io), a free music studio, and render it on your own machine. Everything renders locally, so there are no credits and no download cap. The first commit was on 14 November 2026. By 16 November the repo had 118 commits and 47 merged pull requests, and 0.9.1 was on [npm](https://www.npmjs.com/package/@sarutobi-sasuke/lmms-mcp) with 82 tools.

This post is about what was built and why each part is there. The [release notes](https://github.com/SarutobiSasuke8/lmms-mcp/blob/main/CHANGELOG.md) list every change.

## The one design rule: the project file is the master

Most AI music tools give you an audio file. If one bar is wrong, you generate again and hope.

LMMS MCP writes a normal LMMS project (`.mmp`) instead. You can open it in LMMS and change any note, sound or fader yourself. The agent can also read it back, change one pattern and render again, and the rest of the song stays as it was. The server calls the installed LMMS renderer without opening the editor, so it runs headless.

The first version did only that. It created a project, read the notes from a pattern, replaced one pattern in a copy and rendered a 48 kHz WAV. The proof run rendered two versions of a game cue. The second changed one arpeggio section and kept the other five tracks the same.

## Inputs an agent can actually write

Asking a language model for raw MIDI note numbers and tick positions works badly. So every pattern takes one of four inputs, and three of them read like what a musician would write down:

- **Drum grids.** `X---x---X-x-x---`, where `X` is an accent, `x` a hit, `o` soft, `g` a ghost note and `-` a rest.
- **Melody lines.** `D5:3 F5:3 A5:6 G5:2`, with rests and chords in brackets.
- **Chord progressions.** `Dm Bb F C`, played as block chords, pulses, arpeggios or a bass line, with voice leading that keeps the chords in one register.
- **Raw notes**, for when nothing else fits.

Swing, humanise and transpose work on all of them. `resolve_chords` shows the notes before anything is written. One small fix mattered a lot: LMMS sizes a song from its last note, so empty bars at the end vanish. The server pins the song length, so a 45-bar loop stays 45 bars.

## Finding the right sound

Stock LMMS ships about 1,000 samples and 954 ZynAddSubFX patches, with names like `Fat-Saw-2`. An agent cannot audition them by ear, so the server measures them instead.

`search_sounds` searches a catalogue of 1,106 measured stock sounds by role (bass, lead, pad, pluck, bell, keys, strings, brass, organ, drum, fx) and by tags such as `bright`, `percussive` or `slow-attack`. Each entry carries its level and tuning.

Tuning was a real problem. Some presets are saved at a different base note and play up to two octaves away from the written pitch. The server detects the offset and corrects the track, so a written C sounds as a C. `preview_sound` renders a short audition and reports the level and detected pitch.

## Mixing

`edit_effect` adds reverb, delay, compression, a limiter, EQ, bass boost and stereo width to a track or to the master. Delay times take note values such as `1/8d` and are worked out from the tempo. `automate_track` draws volume, pan, pitch and filter curves.

`apply_edits` runs a whole mixing pass in one call and saves once. If any edit fails, nothing is written. That keeps a half-finished mix from overwriting a good one.

## Listening by measurement

This is the part I care about most. The agent cannot hear, and pretending it can is how you get bad music with confident descriptions.

So `analyze_audio` reports what an engineer would look at: integrated loudness in LUFS (ITU-R BS.1770), true peak, RMS, crest factor, clipped samples, stereo correlation, energy in six frequency bands, the spectral centroid and the loop seam. It can compare sections of a song by bar, detect pitch and return a spectrogram as an image. It ends with plain warnings, for example a section that will thin out in mono.

Every render reports its loudness and true peak. `render_mix` can master to a loudness target with a look-ahead limiter, and it can fold the reverb and delay tail back onto the start so a loop does not cut off its own echoes.

## Game export in one call

`export_game_audio` writes everything a game engine needs:

- **A loop with no gap or click at the join**, with the tail folded into the start.
- **An intro** that leads into the loop.
- **Layers** for adaptive music, such as rhythm, harmony and melody, aligned so they sum back to the full mix. The manifest records how closely they do.
- **Stingers**, short cuts from a bar range with a fade.
- **A manifest** with tempo, bars, loop points in frames, loudness, true peak and a SHA-256 for every file.

OGG output works when ffmpeg is installed. `export_one_shots` trims, fades and peak-matches up to 32 sound effects in one call.

The first full test was a 90 second, 15 track theme, mastered to -16 LUFS and exported with 3 layers in 23 tool calls.

## Checking the work

Measuring a render is not the same as judging an arrangement. Version 0.8.0 added tools for that:

- `lint_arrangement` reads the notes before anything is rendered. Agents tend to give every track its own busy melody, so it counts how many independent melodies play in each bar and checks that the lead repeats its ideas. Each finding comes with a one-sentence fix. `quality_report` checks the render.
- `auto_balance` sets every track's level by measurement in one pass. `compare_to_reference` says how a render differs from a track you want it to sound like.
- `find_loop_points` and `prepare_loop` find a clean loop in any audio file and cut it there.
- `build_audition_page`, `read_feedback`, `remember_taste` and `get_taste` close the loop with a human. The agent builds a page you can listen on, you leave notes, and it remembers what you liked for the next piece.

## Starting points

A blank project is hard for an agent too, so there are several ways to start.

**Blueprints** start a piece from a form. `develop_motif` grows a short idea into variations.

**A phrase library** of 68 tested phrases: chord progressions, piano montunos, house stabs, bass lines, hooks, trumpet section figures and percussion grooves. They fit any key. You can rate them, and the good ones rise to the top.

**Whole pieces.** `compose_piece` writes an arranged piece from a style and a seed (chiptune, adventure, battle, ballad, swing, and later reggae, dub and dubstep) and plans a form to fit the length: theme, contrast, a solo that opens by quoting the theme, a varied return and an ending. `compose_batch` renders several takes and ranks them by measured checks. `lmms-compose` does the same on the command line with no agent at all.

**Writing tools.** `write_melody` writes phrases with one recurring idea, a breath after each phrase and a single climax. `write_accompaniment` writes a backing part to match. `write_solo` writes a lead line for one instrument and splits it into short and long notes, so a staccato sound and a sustained sound can share the part.

**Composer profiles.** There are 11, each a short original piece built on a composer's method and tagged for the game scene it suits:

- **Bach:** a two-voice chase, for puzzle rooms
- **Mozart:** question and answer phrases over broken chords, for town hubs
- **Handel:** a dotted fanfare, for victory stingers
- **Beethoven:** one short-long motif pushed under pressure, for boss reveals
- **Debussy:** whole-tone drift with long gaps, for ruins and underwater maps
- **Satie:** a low anchor and soft chords, for quiet hubs
- **Grieg:** a modal tune over an open drone, for mountain routes
- **Rimsky-Korsakov:** a running figure passed between registers, for fantasy reveals
- **Holst:** attacks grouped in fives over 4/4, for heavy enemy encounters
- **Philip Glass:** a steady pulse with shifting accents, for factory puzzles
- **Nobuo Uematsu:** a minor-key ostinato with offbeat attacks, for 16-bit battles

These are not copies of anyone's music. They borrow a technique, so you get a structure that works for the scene, and then you change it. The sketches use original notes and stock LMMS sounds.

## Better instruments

Stock LMMS sounds are fine for chiptune and synth music. They are not fine for a piano.

So the server can hand an arrangement to real instruments. `export_midi` writes the editable arrangement as MIDI, and `render_vst3_stems` plays each track through [Decent Sampler](https://www.decentsamples.com/product/decent-sampler-plugin/) or [Surge XT](https://surge-synthesizer.github.io/), both free. A setup script downloads pinned portable copies from their publishers and checks their hashes. It leaves your system plug-in folders alone.

`convert_sfz` turns open SFZ sample libraries into Decent Sampler presets, so no editor step is needed. A second setup script fetches an open piano, upright bass, saxophone and jazz drum kit. No samples ship in the package, and some libraries need attribution.

## From a score to a played piano

Version 0.9.0 added a classical route. `import_midi` turns a standard MIDI score into an editable project. It bakes the sustain pedal into note lengths and can unfold repeats that notation programs export only once. `shape_performance` then makes a typed-in score sound played: phrase dynamics, a louder top voice, small accents, a slowdown at phrase ends and a simulated pedal. `master_audio` brings the result to a loudness target.

The test piece was Satie's Gymnopédie No. 1, from a public-domain edition on the [Mutopia Project](https://www.mutopiaproject.org/). The import unfolds it to its full 78 bars. The shaped render runs 219.1 seconds against 216.0 seconds unshaped, mastered to -18 LUFS.

## DJ tools

The DJ tools work on a finished render. `dj_effects` applies filter sweeps, beat repeats, gates, tape stops, spinbacks, echo outs, scratches and more at bar positions. `rearrange_audio` cuts a render into a new order like a DJ edit. Later additions time-stretch loops and chop drum breaks into slices.

## Seeing the library

Two browser pages help a human keep up with what the agent makes. `build_library_page` lists every preset, sample, workspace sound and phrase with filters and audio previews. `tag_sound` keeps metadata for finished pieces (title, composer, genre, mood, game use, licence and credits), so a render on a CC BY sample library carries the credit with it. `build_timeline_page` shows a song as a DAW would, with each stem as a lane under a bar ruler and synced playback with mute and solo.

## How it was built

Claude and Codex worked on the repo in parallel, each on its own branch, with a pull request per feature. That only worked because of the guard rails:

- New features load as modules from `tools/`, so two branches rarely touch the same file.
- CI runs unit tests on Windows and Linux, checks that the server starts, renders with real LMMS and posts a diff of the tool schemas on every pull request. A renamed tool or a new required argument is visible before merge.
- The changelog lists every change that can affect an agent's saved workflow.
- npm releases are published from GitHub Actions with provenance. The 0.9.1 release job ran 226 unit tests and checked that the package holds no audio, tests or private files.

## On main, not released yet

These are merged but not in a tagged release:

- A convolution `space` reverb for sampled instruments: room, hall, church or cathedral, with its level measured against the dry sound.
- The Salamander Grand Piano as the default piano.
- Loop points written into WAV and OGG files, so engines that read them loop at the right place.
- Scale lock, arpeggiate and note probability edits.
- SoundFont rendering through FluidSynth.
- The VST3 route on Linux.

## Limits

It is early, and it says so:

- Tested with stock LMMS 1.2.2 on Windows x64. CI renders on Linux. macOS is not tested.
- The VST3 and sampler route is tested on Windows, with Linux on main.
- The project builder writes 4/4 at a fixed tempo.
- It is instrumental only. I still use Suno for songs with vocals.
- The output still needs a human ear. The measurements catch problems; they do not make taste.
- It is not in the official MCP Registry yet, and the listing stays at alpha.

## Try it

```bash
npx -y @sarutobi-sasuke/lmms-mcp
```

Install LMMS separately, set `LMMS_WORKSPACE` to a folder for projects and renders, and give your client a tool timeout of at least 5 minutes. In Claude Code:

```bash
claude mcp add lmms -e LMMS_WORKSPACE=/path/to/workspace -- npx -y @sarutobi-sasuke/lmms-mcp
```

- **Package:** [@sarutobi-sasuke/lmms-mcp on npm](https://www.npmjs.com/package/@sarutobi-sasuke/lmms-mcp), published from GitHub Actions with provenance.
- **Source and docs:** the repo, setup guide and docs for every tool group are at [github.com/SarutobiSasuke8/lmms-mcp](https://github.com/SarutobiSasuke8/lmms-mcp).
