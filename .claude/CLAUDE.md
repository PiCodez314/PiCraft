# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

PiCraft is a Minecraft: Bedrock Edition add-on built for family LAN play (see `README.md`). Planned features: custom items, magic, Lucky Blocks, bosses, family achievements, quests. Currently at version 0.1.0, early scaffold stage — most pack subfolders are empty placeholders and only a "hello world" script exists.

There is no build tooling or package manifest (no package.json/npm) — this is a plain Bedrock behavior pack + resource pack, authored directly as the files Minecraft loads.

## Structure

- `PiCraft/behavior_pack/` — `manifest.json` declares a script module (`Javascript`, entry `scripts/main.js`) depending on `@minecraft/server`.
  - `scripts/main.js` — entry point, currently just sends a world chat message on load.
  - `scripts/{events,items,magic,mobs,utils}/` — empty, intended module split for gameplay script code.
  - `blocks/`, `entities/`, `items/`, `functions/`, `texts/` — empty, for JSON block/entity/item definitions, `.mcfunction` files, and localization.
- `PiCraft/resource_pack/` — `manifest.json` is currently empty (needs a valid header/module block before the pack will load in-game).
  - `models/`, `sounds/`, `textures/`, `texts/` — empty, for client-side assets.
- `PiCraft/docs/` — empty.
- `PiCraft/changelog.md` — empty.
- `Releases/` — packaged output (e.g. `.mcaddon`), currently empty.
- `tools/` — empty, reserved for build/packaging scripts.

## Notes for future work

- `resource_pack/manifest.json` is empty and must be filled in (with its own UUIDs, distinct from the behavior pack's) before the resource pack is valid.
- Behavior pack scripts use ES module imports from `@minecraft/server` (the Script API) — no bundler is set up yet, so keep in mind Bedrock's script loading model (single entry point per manifest) when splitting code across the `events/items/magic/mobs/utils` folders.
- No git history yet to infer conventions from — confirm naming/UUID/module-split decisions with the user rather than assuming.
