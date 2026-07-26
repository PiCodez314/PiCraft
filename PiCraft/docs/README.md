# PiCraft docs

- [features/](features/) — one file per built feature, the spec produced by `bedrock-designer` / `bedrock-quest-designer` before it was built. Keeps the "why it works this way" around after the build is done.
- [player-guide.md](player-guide.md) — family-facing rundown of what's actually in the add-on right now (items, magic, mobs, etc.) and how to use it in-game.
- [dev-setup.md](dev-setup.md) — expanded technical setup/process notes. `CLAUDE.md` stays focused on Claude Code guidance and gotchas; this is the human-readable version of the parts of that a person might want without opening the whole file.

Feature specs go here when a feature is built — ask Claude Code to save the spec to `docs/features/<feature-name>.md` after `bedrock-designer` produces it.
