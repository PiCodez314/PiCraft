---
name: bedrock-worldgen
description: Use this skill when adding loot to vanilla chests (e.g. "put my item in dungeon chests") or placing custom structures in the world for PiCraft. More advanced/riskier than other content skills — can affect vanilla loot balance or world generation if done carelessly, so this skill is conservative by design and favors the smallest change that achieves the goal.
---

# PiCraft world-gen & loot workflow

This is the riskiest category of change in this project — a mistake here can alter vanilla loot balance across every world using the pack, or, for structure generation, is genuinely hard to get right in Bedrock. Favor the smallest, safest change that achieves what the user wants, and prefer script-based/scoped alternatives over deep vanilla file overrides when they achieve the same player-facing result.

## Adding PiCraft items to existing loot (chests, mob drops)

**Prefer this over structure generation** — it's lower-risk and covers most "I want my item to show up in the world naturally" requests.

1. **Vanilla loot table override**: Bedrock lets a behavior pack override a vanilla loot table by placing a file at the same path, e.g. `PiCraft/behavior_pack/loot_tables/chests/simple_dungeon.json`. This *replaces* the vanilla table entirely — you must include the original vanilla pool entries plus the new PiCraft item, not just add the new entry alone, or players will stop seeing normal loot in Bedrock also. Pull the current vanilla loot table content from `github.com/Mojang/bedrock-samples` (`preview/behavior_pack/loot_tables/...`) as the base before adding entries — never write one from memory.
2. Set a sensible drop weight relative to the existing pool entries — delegate to `bedrock-balance-reviewer` to sanity-check the weight isn't wildly over/under-represented compared to vanilla loot rarity tiers.
3. **Mob drops**: same override pattern, under `loot_tables/entities/<mob>.json`, sourced from the vanilla mob's existing loot table as the base.

## Custom structures

Full custom structure generation (new generated buildings/features placed automatically during chunk generation) is the most complex and error-prone part of Bedrock add-on development — it involves `.mcstructure` files (usually authored in-game via structure blocks, not hand-written JSON) plus jigsaw/feature-rule JSON to control placement.

- **Default recommendation: don't build automatic world-gen structures.** For a family LAN pack, a hand-placed structure (built once in Survival/Creative and left in the shared world) or a `.mcfunction`-summoned structure (placed on command, e.g. via a Lucky Block outcome or quest reward) achieves most of the same "cool place to find/build" goal with far less risk and complexity.
- If the user specifically wants automatic generation anyway, scope it with `bedrock-designer` first, then delegate exact feature-rule/jigsaw JSON verification to `bedrock-researcher` — do not write this JSON from memory, the schema is intricate and low-documentation.
- Structure geometry itself (`.mcstructure`) is typically captured in-game with a structure block and exported, not hand-authored — flag this to the user as a step they'll need to do themselves in Minecraft (place blocks, use a Structure Block, export), since Claude Code can't build a physical structure in-world.

## Validate

Delegate to `bedrock-validator` for JSON syntax on any touched loot table. For loot table overrides specifically, also manually diff against the vanilla source table to confirm nothing was accidentally dropped (a missing vanilla pool entry means players stop getting normal drops from that source).

## What not to do

- Don't override a vanilla loot table with only the new entry — always merge with the existing vanilla pool.
- Don't attempt hand-written `.mcstructure` files — they're a binary/NBT-derived format, not something to author as text JSON.
- Don't add automatic structure generation as a first choice — default to hand-placed or script-summoned structures unless the user explicitly wants true world-gen.
