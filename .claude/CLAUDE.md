# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

PiCraft is a Minecraft: Bedrock Edition add-on built for family LAN play (see `README.md`). Planned features: custom items, magic, Lucky Blocks, bosses, family achievements, quests. Currently at version 0.1.0, early scaffold stage — most pack subfolders are empty placeholders and only a "hello world" script exists.

There is no build tooling or package manifest (no package.json/npm) — this is a plain Bedrock behavior pack + resource pack, authored directly as the files Minecraft loads.

## Structure

- `PiCraft/behavior_pack/` — `manifest.json` declares a script module (`Javascript`, entry `scripts/main.js`) depending on `@minecraft/server`.
  - `scripts/main.js` — entry point; imports feature modules (e.g. `items/luckyBlock.js`) for their side effects (event subscriptions).
  - `scripts/{events,items,magic,mobs,utils}/` — module split for gameplay script code, populated per-feature as built.
  - `blocks/`, `entities/`, `items/` — JSON block/entity/item definitions, one file per custom object (e.g. `lucky_block.json`, `dragon.json`).
  - `loot_tables/` — e.g. `blocks/empty.json` used to suppress a custom block's default self-drop.
  - `functions/`, `texts/` — still empty; reserved for `.mcfunction` files and behavior-pack-side localization.
- `PiCraft/resource_pack/` — `manifest.json` has its own UUIDs (distinct from the behavior pack's) and a `resources` module.
  - `blocks.json` — maps block identifiers to resource-pack textures/sounds (required for blocks to render/name correctly, separate from the behavior-pack block JSON).
  - `entity/` — client entity JSON (geometry/texture/animation/render-controller wiring), separate from `behavior_pack/entities/` (server-side behavior).
  - `models/entity/`, `animations/`, `render_controllers/` — geometry, animation, and render-controller JSON for custom entities.
  - `textures/{blocks,items,entity}/` — PNGs; `textures/item_texture.json` and `textures/terrain_texture.json` map short texture names to these files.
  - `texts/` — `languages.json` (lists active locales, e.g. `en_US`) + `en_US.lang` (display-name key/value pairs). Both are required together or neither loads.
  - `sounds/` — still empty.
- `PiCraft/docs/` — empty.
- `PiCraft/changelog.md` — empty.
- `Releases/` — packaged output (e.g. `.mcaddon`), currently empty.
- `tools/` — empty, reserved for build/packaging scripts.

## Dev pack setup

Dev packs are symlinked from `com.mojang/development_behavior_packs/PiCraft` and `development_resource_packs/PiCraft` to this repo (see `README.md`). Because they're symlinks, file edits are picked up live — no copying needed. But **Minecraft must be fully closed and relaunched** (not just world-reloaded) to pick up new `texts/languages.json`, `.lang` files, or newly-added JSON schema-affecting files like `blocks.json`. A world's active pack list also needs the pack manually toggled off/on in world settings if it was already active before a manifest version bump.

## Lessons learned (Bedrock-specific gotchas)

These cost real debugging time — check them first before re-deriving from scratch:

- **World-load chat messages get swallowed.** `world.sendMessage()` called from top-level `system.run()` at script load may not display until the player opens chat once (Bedrock's chat queue isn't ready yet). Fix: use `world.afterEvents.playerSpawn.subscribe(...)` (with `event.initialSpawn` check) instead of firing at world load — it's also more useful since it gives you the player object.
- **Vanilla texture/model files are not directly referenceable.** Bedrock resource packs cannot point `textures.json`/`terrain_texture.json` at vanilla asset paths — the actual PNG/geometry file must be copied into this pack's own folder. We had no access to vanilla asset files in this environment, so we generated flat-color placeholder PNGs by hand (via a small Python script writing raw PNG bytes) as stand-ins. Real art (or extracted vanilla files) can swap in later without touching JSON structure.
- **Custom item/block/entity names silently fail to pick up `.lang` translations** in some cases (seen on both the Lucky Block item and the Dragon Egg). Two independent fixes were needed:
  - For regular items: add `minecraft:display_name: { "value": "..." }` directly in the item JSON — this reliably overrides/bypasses the lang system.
  - For `minecraft:entity_placer` items tied to a `is_summonable`/`is_spawnable` entity: Bedrock renders these using the vanilla spawn-egg naming convention regardless of `display_name`, i.e. it looks up `item.spawn_egg.entity.<entity identifier>.name` in the `.lang` file specifically — that exact key must exist.
  - Also always double check `languages.json` + `.lang` are both present (see Dev pack setup above) before assuming a naming bug.
- **Don't guess at Bedrock component names/fields.** Several were wrong on first pass and had to be corrected after checking Mojang's vanilla samples (`github.com/Mojang/bedrock-samples`, `preview` branch, `behavior_pack/entities/*.json`) or Microsoft Learn's entity component reference:
  - Sit AI is `minecraft:sittable` + `minecraft:behavior.stay_while_sitting` (NOT `minecraft:is_sitting` / `minecraft:behavior.sit` — those don't exist and fail schema validation with a clear "not present in the Schema" error).
  - Flight/aerial rider steering is `minecraft:input_air_controlled` (NOT `minecraft:input_ground_controlled`, which is for ground mounts like horses) — requires `format_version` ≥ `1.21.90`. Pair with `minecraft:vertical_movement_action` (`vertical_velocity` field) for jump-to-ascend, and `minecraft:can_fly` as a pathfinding hint only (it does not grant control).
  - **When unsure, check `wolf.json` (tameable/sittable reference) or `happy_ghast.json` (rideable/flyable reference) in `Mojang/bedrock-samples` before writing a component from memory.**
- **Autonomous AI behaviors fight rider input.** A wandering behavior like `minecraft:behavior.random_fly` stays active and competes with `minecraft:input_air_controlled` even while a player is riding, producing wobbly/unpredictable movement — Bedrock does not auto-suppress AI goals just because the entity is mounted. Fix: gate the wandering behavior behind a component group, and toggle it via `minecraft:rideable`'s `on_rider_enter_event` / `on_rider_exit_event` (remove on mount, re-add on dismount). Vanilla's `happy_ghast.json` uses a more elaborate `entity_sensor` + mobile/immobile component-group swap for the same purpose; the simpler enter/exit-event toggle is sufficient for this project's scope.
- **Git Bash's `/d/...`-style path mount is flaky for file writes/reads in this environment** (intermittent `FileNotFoundError` even right after `mkdir -p` succeeded on the same path). Prefer Windows-style paths (`d:/PiCraft/...`) in Python/Bash one-liners run via the Bash tool.
