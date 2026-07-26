---
name: mcaddon-packager
description: Use this skill when the user wants to package PiCraft into a shippable .mcaddon file (e.g. "package this up", "build a release", "make an .mcaddon"), or when bumping pack versions for a release. Handles manifest version bumps and zipping behavior_pack + resource_pack into Releases/.
---

# PiCraft packaging workflow

PiCraft ships as a `.mcaddon` — a zip containing both `PiCraft/behavior_pack/` and `PiCraft/resource_pack/`, each with their own `manifest.json` (see `.claude/CLAUDE.md` for pack structure). There's no build tooling in this repo yet — packaging is a manual zip + version bump.

## Current manifest state

- Behavior pack (`PiCraft/behavior_pack/manifest.json`): header version, `min_engine_version`, and a script module version — each independently versioned.
- Resource pack (`PiCraft/resource_pack/manifest.json`): its own header + module version, distinct UUIDs from the behavior pack.
- The two packs reference each other only loosely (behavior pack lists the resource pack's UUID as a dependency) — **both manifests' `dependencies` block must stay in sync if either pack's own UUID or version changes.**

## Steps to release

1. **Confirm scope with the user** — is this a version bump for new features since the last release, or just a repackage of the current state? Check `git log` for what's changed since the last tag/release if unclear.

2. **Bump versions** (only if this is a real release, not a repackage):
   - Increment the `version` array in both `behavior_pack/manifest.json` header AND its script module block.
   - Increment the `version` array in `resource_pack/manifest.json` header AND its resources module block.
   - Update the behavior pack's `dependencies` entry that references the resource pack's UUID to match the resource pack's new version.
   - Follow semver-by-convention: patch for fixes/placeholder-art swaps, minor for new features (new item/block/entity/system), major only if the user says so.
   - Remind the user: a world's active pack list needs the pack manually toggled off/on in world settings after a manifest version bump (see CLAUDE.md Dev pack setup) — this applies to their own test world too.

3. **Validate before zipping** — delegate to the `bedrock-validator` agent to catch broken JSON/wiring before it ships in a package, since a bad zip is harder to debug than a bad dev-pack symlink.

4. **Zip the packs.** Each pack's contents go in its own top-level folder inside the `.mcaddon` (which is just a renamed `.zip`):
   ```
   PiCraft_v<version>.mcaddon
   ├── behavior_pack/...
   └── resource_pack/...
   ```
   Exclude OS cruft (`.DS_Store`, `Thumbs.db`) and this repo's own tooling dirs (`.claude/`, `.git/`) from the zip — only the two pack folders belong inside.

5. **Save to `Releases/`** as `PiCraft_v<version>.mcaddon` (e.g. `PiCraft_v1.1.0.mcaddon`). Don't overwrite a prior release file — each version gets its own file so old releases stay available.

6. **Update `PiCraft/changelog.md`** for the release — delegate to the `bedrock-changelog` skill if entries for this cycle's features haven't already been logged.

## What not to do

- Don't bump version numbers without the user's confirmation on scope (patch/minor/major) unless they've stated it explicitly.
- Don't zip with the manifests out of sync with each other's dependency versions — Minecraft will reject or misload the pack.
