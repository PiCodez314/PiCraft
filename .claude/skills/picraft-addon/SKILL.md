---
name: picraft-addon
description: Use this skill when adding any new item, block, or entity to the PiCraft Minecraft Bedrock add-on (e.g. "add a new item", "add a new block", "add a new mob/entity", "build a new lucky block/wand/pet"). Covers the full repeatable workflow — behavior-pack JSON, resource-pack wiring, placeholder art, localization, and script logic — plus the Bedrock-specific gotchas that have caused rework in this project before.
---

# PiCraft add-on workflow

PiCraft is a Minecraft: Bedrock Edition add-on (behavior pack + resource pack, no build tooling — files are authored directly as Minecraft loads them). This skill captures the repeatable process for adding a new item, block, or entity, based on the Lucky Block, pet dragon, and magic item (wand/hook/scroll) features already built in this repo.

Read `.claude/CLAUDE.md` first — it documents the current pack structure and a "Lessons learned" section with hard-won Bedrock gotchas. Treat that section as required reading before writing any entity/item/block component from memory.

## Standard workflow for a new item/block/entity

1. **Scope it with the user first.** Ask about behavior specifics (trigger method, cooldown vs one-shot, visual complexity) before writing files — see how prior features (Lucky Block outcome pool, dragon riding/taming, magic item cooldowns) were scoped via clarifying questions before implementation.

2. **Behavior-pack definition** (`PiCraft/behavior_pack/`):
   - New item: `items/<name>.json` with `minecraft:display_name` set explicitly (see Lessons learned — don't rely on `.lang` alone).
   - New block: `blocks/<name>.json`; if it shouldn't drop itself on break, add a matching empty loot table under `loot_tables/blocks/`.
   - New entity: `entities/<name>.json`. **Before writing any AI/behavior component, check the exact component name against a real vanilla sample** (`github.com/Mojang/bedrock-samples`, `preview` branch, `behavior_pack/entities/`) — `wolf.json` for tameable/sittable patterns, `happy_ghast.json` for rideable/flyable patterns. Do not guess component names; several were wrong on first pass in this project and failed schema validation.

3. **Script logic** (`PiCraft/behavior_pack/scripts/`):
   - Split by feature area under `items/`, `magic/`, `mobs/`, `events/`, or `utils/` — one file per feature, imported into `main.js` for its side effects (see `luckyBlock.js`, `fireballWand.js` for the pattern).
   - Verify Script API method/property names against Microsoft Learn (`learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/...`) before using them — several were wrong on first pass in this project (e.g. `minecraft:fireball` isn't summonable, `Block.isSolid` is experimental-only and unreliable without experimental APIs enabled — use `isAir`/`isLiquid` instead).
   - Register the new script file in `main.js` with a bare `import "./path/to/file.js";`.

4. **Resource-pack wiring** (`PiCraft/resource_pack/`):
   - Item/block icon: generate a flat-color placeholder PNG (there's no access to vanilla texture files in this environment — see Lessons learned) and add an entry to `textures/item_texture.json` (items) or `textures/terrain_texture.json` + `blocks.json` (blocks).
   - Entity: needs a full client entity JSON under `entity/`, plus `models/entity/*.geo.json`, `animations/*.animation.json`, `render_controllers/*.render_controllers.json`, and a texture — all cross-referenced by short names, not file paths, in the client entity JSON.
   - Add display name(s) to `texts/en_US.lang`. For `minecraft:entity_placer` items tied to a summonable entity, ALSO add the `item.spawn_egg.entity.<identifier>.name` key — Bedrock ignores `minecraft:display_name` for these and looks up that exact key instead.

5. **Validate before calling it done:**
   - `python3 -c "import json; json.load(open('<path>'))"` on every JSON file touched (Windows-style paths, e.g. `d:/PiCraft/...` — Git Bash's `/d/...` mount is flaky in this environment for file writes/reads).
   - `node --check <path>` on every script file touched.

6. **Tell the user to fully close and relaunch Minecraft**, not just reload the world, before testing — new script files, `.lang`/`languages.json` changes, and schema-affecting JSON (like `blocks.json`) are not picked up by a world reload alone.

## When something doesn't work in-game

Don't guess-and-patch repeatedly. If a component/property/behavior doesn't work as expected after one reasonable attempt:
1. Check `.claude/CLAUDE.md`'s "Lessons learned" section for a known gotcha.
2. If not there, verify against Microsoft Learn's Script API/entity reference docs or a real vanilla sample in `Mojang/bedrock-samples`, not assumption.
3. If still stuck, add a minimal, temporary diagnostic (e.g. `player.sendMessage(...)` at decision points) to see what's actually happening in-game rather than continuing to speculate blind.
4. Once root-caused, remove the diagnostic and record the finding in CLAUDE.md's Lessons learned section if it's likely to recur.

## After building

Ask whether to commit and push — this project treats each feature (Lucky Block, dragon, magic system) as its own commit with a descriptive message covering what was built and why any non-obvious implementation choices were made.
