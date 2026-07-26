# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

PiCraft is a Minecraft: Bedrock Edition add-on (behavior pack + resource pack). The project is currently a bare scaffold — `PiCraft/manifest.json`, `PiCraft/changelog.md`, `PiCraft/behavior_pack/`, `PiCraft/resource_pack/`, and `PiCraft/docs/` all exist but are empty. There is no build tooling, package manifest, or source code yet, and this directory is not a git repository.

## Expected structure

Bedrock add-ons follow a standard two-pack layout:

- `PiCraft/manifest.json` — pack manifest(s) (header/module UUIDs, format_version, dependencies). Bedrock add-ons typically need a `manifest.json` per pack (behavior_pack and resource_pack each have their own), so expect this to split as content is added.
- `PiCraft/behavior_pack/` — entities, items, blocks, loot tables, recipes, scripts (functions/mcfunction or Script API), spawn rules.
- `PiCraft/resource_pack/` — textures, models, sounds, UI, lang files, render controllers/animations.
- `PiCraft/docs/` — project documentation.
- `PiCraft/changelog.md` — version history.
- `Releases/` — packaged output (e.g. `.mcaddon`/`.mcpack` builds), currently empty.

## Notes for future work

- Since there's no git history or existing code yet, there are no established conventions to infer — confirm structural decisions (manifest UUIDs, folder split, naming) with the user rather than assuming.
- Update this file once real manifests, packs, and any build/packaging scripts exist, including actual commands for packaging/testing in-game.
