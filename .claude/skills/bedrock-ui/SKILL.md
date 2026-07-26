---
name: bedrock-ui
description: Use this skill when adding an in-game menu, form, or UI prompt to PiCraft via script (e.g. "add a shop menu", "let the player pick a spell from a list", "show a confirmation dialog"). Script-only, no new JSON schema — uses the @minecraft/server-ui module.
---

# PiCraft custom UI workflow

Bedrock supports simple in-game menus via the separate `@minecraft/server-ui` module (distinct from `@minecraft/server`) — `ActionFormData` (button list), `MessageFormData` (yes/no or two-button dialog), and `ModalFormData` (form with toggles/sliders/dropdowns/text fields). These are script-only — no behavior-pack JSON or resource-pack asset work needed.

## Steps

1. **Check the dependency is declared.** `PiCraft/behavior_pack/manifest.json` currently only depends on `@minecraft/server` — confirm `@minecraft/server-ui` is listed in `dependencies` (with a version) before importing it in script; add it if missing (check the current `@minecraft/server` version already pinned in the manifest and use `bedrock-researcher` to find the matching compatible `@minecraft/server-ui` version).

2. **Scope the menu with the user** if not already clear: what triggers it opening (item use, block interact, command), what options/fields it shows, and what happens on each choice/submit.

3. **Verify the exact form API shape** via `bedrock-researcher` before writing script from memory — `ActionFormData`/`MessageFormData`/`ModalFormData` builder methods and the `.show(player)` response shape (`selection`, `canceled`, field values array) are easy to get subtly wrong.

4. **Write the script** under `PiCraft/behavior_pack/scripts/` — pick the module folder matching what the menu is for (e.g. a shop menu tied to an NPC goes under `mobs/` or a new `ui/` folder if this becomes a recurring pattern; a spell-select menu goes under `magic/`). Import it into `main.js`.

5. **Handle cancellation.** Every form's `.show()` response can have `canceled: true` (player pressed Escape/closed the menu) — always branch on this before reading selection/field values, or script errors will occur when a player just backs out.

## Common menu patterns for this project

- **Spell/ability select** — `ActionFormData` with one button per known spell, triggered by a "spellbook" item use.
- **Shop/trade** — `ActionFormData` listing items with costs in the button text, confirming via a follow-up `MessageFormData` before executing the trade.
- **Settings/confirmation** — `MessageFormData` for a simple yes/no (e.g. "Really open this Lucky Block?" if the user wants a confirm step added later).

## Validate

`node --check` the touched script file, or delegate to `bedrock-validator`. Confirm `@minecraft/server-ui` appears in the manifest dependencies if this is the first UI feature added.
