---
name: bedrock-sound-fx
description: Use this skill when adding sound effects or particle effects to a PiCraft item/block/entity/spell (e.g. "add a sound when the wand fires", "add particles to the teleport scroll"). Covers sound_definitions.json wiring, playing sounds/particles from script, and the currently-empty sounds/ folder.
---

# PiCraft sound & particle workflow

`PiCraft/resource_pack/sounds/` is currently empty and unused — this skill establishes the pattern for wiring audio and particle effects into items/blocks/entities/spells.

## Sounds

1. **Prefer reusing vanilla sound events over adding new audio files first.** Bedrock ships with a large built-in sound event library (e.g. `random.orb`, `mob.enderman.teleport`, `random.explode`) playable directly from script via `world.playSound(soundId, location)` or `player.playSound(...)` with no resource-pack wiring needed at all. Check with the `bedrock-researcher` agent for the exact vanilla sound event ID that fits before assuming a custom sound file is needed — this is the fastest path and needs zero asset work.

2. **If a genuinely custom sound is needed** (no vanilla event fits, or the user has a specific audio file to include):
   - Add the audio file (`.ogg` format — Bedrock does not support `.mp3`/`.wav` directly) under `PiCraft/resource_pack/sounds/<category>/<name>.ogg`.
   - Register it in `PiCraft/resource_pack/sounds/sound_definitions.json` (create this file if it doesn't exist), mapping a short sound event name to the file path, following the format documented at Microsoft Learn's sound definitions reference — verify the exact JSON shape via `bedrock-researcher` before writing it, this file's schema is easy to get wrong (category, min/max distance, volume/pitch fields).
   - Play it from script the same way as a vanilla sound: `world.playSound("<your_event_name>", location)`.

## Particles

1. **Vanilla particle effects are usable directly from script** via `world.spawnParticle(particleId, location)` (or a dimension's `spawnParticle`) with no resource-pack wiring — e.g. `minecraft:critical_hit_emitter`, `minecraft:endrod`, `minecraft:heart_particle`. Check vanilla particle IDs via `bedrock-researcher` first; this covers most "make it feel magical" requests (wand casts, teleport puffs, level-up sparkles) without any custom asset work.

2. **Custom particle definitions** (new visual effect, not just reusing vanilla) require a full particle JSON under `PiCraft/resource_pack/particles/<name>.json` plus a texture — this is significantly more involved (emitter shape, component list, texture UV). Only go this route if the user specifically wants a visual vanilla doesn't have; otherwise steer back to a vanilla particle ID, since kids iterating on "look and feel" usually want fast turnaround over pixel-perfect custom effects.

## Where to hook sounds/particles in

Both are typically triggered from the same script event that already handles an item's/spell's core logic (e.g. the fireball wand's `itemStartUse` handler) — add the `playSound`/`spawnParticle` call alongside the existing logic in `PiCraft/behavior_pack/scripts/<module>/<feature>.js` rather than creating a separate file for it.

## Validate

`node --check` the touched script file (or delegate to `bedrock-validator`); if a custom `sound_definitions.json` was added, confirm it's valid JSON and the referenced `.ogg` file exists on disk.
