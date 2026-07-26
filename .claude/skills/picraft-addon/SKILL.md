---
name: picraft-addon
description: Use this skill when adding any new item, block, or entity to the PiCraft Minecraft Bedrock add-on (e.g. "add a new item", "add a new block", "add a new mob/entity", "build a new lucky block/wand/pet"). Covers the full repeatable workflow — behavior-pack JSON, resource-pack wiring, placeholder art, localization, and script logic — plus the Bedrock-specific gotchas that have caused rework in this project before.
---

# PiCraft add-on workflow

PiCraft is a Minecraft: Bedrock Edition add-on (behavior pack + resource pack, no build tooling — files are authored directly as Minecraft loads them). This skill captures the repeatable process for adding a new item, block, or entity, based on the Lucky Block, pet dragon, and magic item (wand/hook/scroll) features already built in this repo.

Read `.claude/CLAUDE.md` first — it documents the current pack structure and a "Lessons learned" section with hard-won Bedrock gotchas. Treat that section as required reading before writing any entity/item/block component from memory.

## Standard workflow for a new item/block/entity

1. **Scope it with the user first.** Ask about behavior specifics (trigger method, cooldown vs one-shot, visual complexity) before writing files — see how prior features (Lucky Block outcome pool, dragon riding/taming, magic item cooldowns) were scoped via clarifying questions before implementation. For a vague or open-ended request (e.g. "add a boss fight", "add achievements"), delegate this scoping step to the `bedrock-designer` agent, which produces a concrete spec (files, components, behaviors) to implement against instead of scoping ad hoc.

2. **Behavior-pack definition** (`PiCraft/behavior_pack/`):
   - New item: `items/<name>.json` with `minecraft:display_name` set explicitly (see Lessons learned — don't rely on `.lang` alone).
   - New block: `blocks/<name>.json`; if it shouldn't drop itself on break, add a matching empty loot table under `loot_tables/blocks/`.
   - New entity: `entities/<name>.json`. **Before writing any AI/behavior component, check the exact component name against a real vanilla sample** (`github.com/Mojang/bedrock-samples`, `preview` branch, `behavior_pack/entities/`) — `wolf.json` for tameable/sittable patterns, `happy_ghast.json` for rideable/flyable patterns. Do not guess component names; several were wrong on first pass in this project and failed schema validation.

3. **Script logic** (`PiCraft/behavior_pack/scripts/`):
   - Split by feature area under `items/`, `magic/`, `mobs/`, `events/`, or `utils/` — one file per feature, imported into `main.js` for its side effects (see `luckyBlock.js`, `fireballWand.js` for the pattern).
   - Verify Script API method/property names against Microsoft Learn (`learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/...`) before using them — several were wrong on first pass in this project (e.g. `minecraft:fireball` isn't summonable, `Block.isSolid` is experimental-only and unreliable without experimental APIs enabled — use `isAir`/`isLiquid` instead).
   - Register the new script file in `main.js` with a bare `import "./path/to/file.js";`.

4. **Resource-pack wiring** (`PiCraft/resource_pack/`):
   - Item/block icon: delegate placeholder art generation to the `bedrock-asset-gen` agent (flat-color PNG — there's no access to vanilla texture files in this environment, see Lessons learned), then add the entry it reports to `textures/item_texture.json` (items) or `textures/terrain_texture.json` + `blocks.json` (blocks) yourself — asset generation and JSON wiring are separate steps.
   - Entity: needs a full client entity JSON under `entity/`, plus `models/entity/*.geo.json`, `animations/*.animation.json`, `render_controllers/*.render_controllers.json`, and a texture — `bedrock-asset-gen` can produce the placeholder geometry/animation/texture set; all pieces are cross-referenced by short names, not file paths, in the client entity JSON.
   - Add display name(s) to `texts/en_US.lang`. For `minecraft:entity_placer` items tied to a summonable entity, ALSO add the `item.spawn_egg.entity.<identifier>.name` key — Bedrock ignores `minecraft:display_name` for these and looks up that exact key instead.

5. **Validate before calling it done.** Delegate to the `bedrock-validator` agent, passing it the list of touched files — it runs JSON/JS syntax checks and cross-checks wiring (texture entries, `.lang` keys, loot table references, `main.js` script imports). Fix anything it flags before proceeding.

6. **Tell the user to fully close and relaunch Minecraft**, not just reload the world, before testing — new script files, `.lang`/`languages.json` changes, and schema-affecting JSON (like `blocks.json`) are not picked up by a world reload alone.

## When something doesn't work in-game

Don't guess-and-patch repeatedly. Delegate to the `bedrock-debugger` agent with the exact symptom/error — it checks CLAUDE.md's "Lessons learned" section for a known gotcha first, then verifies uncertain facts via `bedrock-researcher` (Microsoft Learn / vanilla `Mojang/bedrock-samples`), and only proposes a minimal temporary diagnostic (e.g. `player.sendMessage(...)` at a decision point) if the cause is still unclear — rather than guessing and re-patching blindly. Once root-caused, remove any diagnostic and record the finding in CLAUDE.md's Lessons learned section if it's likely to recur.

## After building

Ask whether to commit and push — this project treats each feature (Lucky Block, dragon, magic system) as its own commit with a descriptive message covering what was built and why any non-obvious implementation choices were made.
