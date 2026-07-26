---
name: bedrock-recipes
description: Use this skill when adding a crafting, smelting, or brewing recipe to PiCraft (e.g. "make the wand craftable", "add a smelting recipe for X", "let players combine these items"). Covers recipe JSON, tying it to existing or new items, and validating it doesn't collide with vanilla recipes.
---

# PiCraft recipe workflow

Bedrock recipes are standalone JSON files under `PiCraft/behavior_pack/recipes/` (create this folder if it doesn't exist yet — it's not part of the current structure). Each recipe file is independent of the item/block definition it produces.

## Recipe types

- **Shaped crafting** (`minecraft:recipe_shaped`) — ingredients placed in a specific pattern in a 3x3 (or 2x2) grid. Use for anything where arrangement matters (tools, weapons).
- **Shapeless crafting** (`minecraft:recipe_shapeless`) — any arrangement of the listed ingredients. Use for simple combination items (dye mixes, simple consumables).
- **Furnace/smelting** (`minecraft:recipe_furnace`) — single input + smelting time, output. Also applies to smokers/blast furnaces via `tags`.
- **Brewing** (`minecraft:recipe_brewing_mix` / `minecraft:recipe_brewing_container`) — potion-style transformations; more niche, only needed for potion-like magic items.

## Steps

1. **Confirm the recipe shape with the user** if not already stated: what ingredients (vanilla items, e.g. `minecraft:diamond`, or existing PiCraft items), what arrangement (shaped vs shapeless), and what it produces (existing PiCraft item, or does the item need to be created first via the `picraft-addon` skill).

2. **Verify the exact recipe component name and field shape** via the `bedrock-researcher` agent before writing JSON from memory — recipe schema has changed across format versions and this project has been burned by guessed component names before.

3. **Write the recipe JSON** under `PiCraft/behavior_pack/recipes/<name>.json`, namespaced identifier (e.g. `picraft:fireball_wand`), referencing ingredient item identifiers exactly as they appear in vanilla (`minecraft:*`) or in `PiCraft/behavior_pack/items/*.json`.

4. **Check for collisions.** A shaped recipe using an identical pattern + ingredients to an existing vanilla or PiCraft recipe will silently conflict or override. Grep existing recipes under `PiCraft/behavior_pack/recipes/` for the same ingredient combination before finalizing the pattern.

5. **Consider whether it should be unlocked immediately or gated** — Bedrock recipes support an `unlock` condition (e.g. requires having picked up a specific item first) if the user wants progression-gated crafting rather than always-available.

6. **Validate** — delegate to `bedrock-validator` for JSON syntax; it doesn't currently check recipe-specific wiring, so also manually confirm every ingredient identifier referenced actually exists (vanilla or in this repo's `items/`/`blocks/`).

## What not to do

- Don't reuse a vanilla recipe's exact shape+ingredients unless intentionally overriding it (and if so, confirm that's the intent — accidental vanilla recipe overrides are a common mistake).
- Don't guess at whether smelting time/XP yield fields are required — verify via `bedrock-researcher`.
