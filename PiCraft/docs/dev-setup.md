# Dev setup (detailed)

See the repo [README.md](../../README.md#development-setup) for the symlink setup steps — this doc covers the rest of the dev loop.

## Testing a change

1. Edit files in `behavior_pack/` or `resource_pack/` — the dev packs are symlinked, so Minecraft reads changes live.
2. Most JSON/script changes are picked up by just reloading the world (Escape → world settings, or `/reload` if applicable).
3. **Fully close and relaunch Minecraft** (not just reload) when you change `texts/languages.json`, any `.lang` file, or add a new file that affects pack schema (e.g. a new `blocks.json` entry) — these are read at pack-load time, not world-load time.
4. If a pack was already active in a world before a `manifest.json` version bump, re-toggle it off/on in world settings — Minecraft caches the pack version per-world.

## Packaging a release

Ask Claude Code to "package a release," or run the `mcaddon-packager` skill directly. It bumps manifest versions and zips `behavior_pack` + `resource_pack` into `Releases/`.

## Full technical notes

`.claude/CLAUDE.md` has the authoritative structure reference and the running list of Bedrock-specific gotchas (component names, timing issues, etc.) discovered while building this pack.
