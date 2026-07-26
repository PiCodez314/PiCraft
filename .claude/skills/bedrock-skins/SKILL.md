---
name: bedrock-skins
description: Use this skill when adding custom player character skins to PiCraft (e.g. "add a new skin", "make a family member skin pack", "let players pick a custom look"). Covers the skin_pack format, which is a separate top-level pack type from behavior_pack/resource_pack, and the placeholder-art approach for skin textures given no access to real art tools in this environment.
---

# PiCraft player skins workflow

Player skins are a **separate pack type** from `PiCraft/behavior_pack/` and `PiCraft/resource_pack/` — a `skin_pack` is its own standalone pack with its own manifest, not a subfolder of either existing pack. This project doesn't have one yet; this skill creates and maintains it.

## One-time setup: create the skin pack

If `PiCraft/skin_pack/` doesn't exist yet, create it:

```
PiCraft/skin_pack/
  manifest.json
  skins.json
  <skin-name>.png   (one or more, at pack root — no subfolders)
```

`manifest.json` — two UUIDs required (distinct from behavior_pack's and resource_pack's), module `type` must be `"skin_pack"` (not `data`/`resources`):

```json
{
  "format_version": 1,
  "header": {
    "name": "PiCraft Skins",
    "version": [1, 0, 0],
    "uuid": "<new uuid>"
  },
  "modules": [
    {
      "type": "skin_pack",
      "version": [1, 0, 0],
      "uuid": "<new uuid>"
    }
  ]
}
```

`skins.json`:

```json
{
  "serialize_name": "PiCraft Skins",
  "localization_name": "PiCraft Skins",
  "skins": [
    {
      "localization_name": "<skin_name>",
      "geometry": "geometry.humanoid.custom",
      "texture": "<skin_name>.png",
      "type": "free"
    }
  ]
}
```

- `geometry` must be exactly `"geometry.humanoid.custom"` (Steve arm width) or `"geometry.humanoid.customSlim"` (Alex arm width) — **no other value is supported**. Custom body-shape geometry (a bespoke `.geo.json` like entities use) is not possible for skin packs; Microsoft Learn explicitly documents this as unsupported. Don't attempt it.
- Add a `.lang` entry for the pack name/skin names under `skin_pack/texts/en_US.lang` if display names need localizing (`skinpack.<pack_name>=PiCraft Skins`, `skin.<pack_name>.<skin_name>=<Display Name>`), matching the `texts/languages.json` + `.lang` pairing pattern already used elsewhere in this repo (see CLAUDE.md's dev pack setup note — both files are required together).

## Adding a new skin

1. **Check `skin_pack/skins.json` exists first** — if not, do the one-time setup above.
2. Generate the texture: a 64x64 PNG following the standard Steve/Alex UV layout (head/body/arms/legs regions). Delegate to `bedrock-asset-gen` if it's been extended to handle skin UV layouts, otherwise generate directly via the same raw-PNG-bytes approach used for item/block textures (see `.claude/agents/bedrock-asset-gen.md`) — but note the UV map is fixed and more complex than a flat 16x16 icon; keep the design as simple flat-color body-region blocks (e.g. one color for shirt region, another for pants region, a skin-tone color for head/hands) rather than attempting detailed shading, since precise UV alignment matters here (a misaligned pixel shows up as a visibly wrong texture on the 3D model, unlike a flat icon).
3. Pick `geometry.humanoid.custom` (Steve, wider arms) or `geometry.humanoid.customSlim` (Alex, narrower arms) based on what's asked for; default to `custom` if unspecified.
4. Add the entry to `skins.json`.
5. Save the PNG to `PiCraft/skin_pack/<skin-name>.png` — **pack root only, no subfolder**, or Bedrock won't find it.

## Testing in-game

Same symlink concept as behavior/resource packs but less reliable in practice: `development_skin_packs/PiCraft` under `com.mojang` is community-reported as flaky. If a symlinked dev skin pack doesn't show up after a full Minecraft relaunch, fall back to copying `skin_pack/` directly into `com.mojang/skin_packs/PiCraft` for testing (a real copy, not a symlink) — tell the user this is a one-off manual step if the symlink approach fails, don't silently assume the symlink worked.

Skins are applied via the in-game "Change Character" / Skins screen (Dressing Room), not via a script API — there's no programmatic way to force-apply a skin to a player from behavior-pack script.

## What not to do

- Don't put skin files under `resource_pack/` or `behavior_pack/` — they belong in their own `skin_pack/` directory.
- Don't invent extra `skins.json` fields (no persona/arms/slot fields exist in this schema — verified against Microsoft Learn's skin pack reference, don't add fields from memory of other Bedrock pack types).
- Don't attempt custom skin geometry — only the two built-in humanoid geometries are usable.

## Validate

Delegate to `bedrock-validator` (or check manually) that `skins.json` is valid JSON, every `texture` filename referenced exists at `skin_pack/` root, and `manifest.json` has two distinct UUIDs not colliding with `behavior_pack/manifest.json` or `resource_pack/manifest.json`.
