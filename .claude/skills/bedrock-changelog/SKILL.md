---
name: bedrock-changelog
description: Use this skill after a PiCraft feature is completed and committed, to append an entry to PiCraft/changelog.md. Also use when packaging a release (mcaddon-packager) to ensure the current cycle's features are logged. Keeps the changelog from rotting by reusing info already produced during the build rather than re-deriving it.
---

# PiCraft changelog workflow

`PiCraft/changelog.md` tracks user-facing changes per version/release. It currently starts empty — this skill establishes and maintains its format.

## When to add an entry

- Immediately after a feature is built and committed (Lucky Block, new item, new mob, magic system, etc.) — reuse the description already written for the commit message rather than re-deriving what changed.
- When `mcaddon-packager` bumps a release version, confirm every feature committed since the last release has a changelog entry; add any missing ones by checking `git log` for feature commits since the last version bump.

## Format

Group entries under a version heading matching the manifest version at time of release (unreleased work goes under an `## Unreleased` heading at the top until the next version bump, then gets retitled to that version number):

```markdown
# Changelog

## Unreleased
- Added <feature>: <one-line user-facing description>

## v1.0.0
- Added Lucky Block with randomized outcome pool
- Added tameable, rideable pet dragon
- Added magic system: fireball wand, grapple hook, teleport scroll
```

- Write entries from the **player's** perspective (what they can now do/see in-game), not implementation detail — "Added a Lucky Block that drops random rewards when broken," not "Added `lucky_block.json` with loot table wiring."
- One line per feature; don't split a single feature across multiple bullets unless it has genuinely distinct player-facing parts.
- Keep prior version sections untouched — only the `## Unreleased` section and the newest release heading should change in a given pass.

## What not to do

- Don't log internal refactors, tooling changes, or non-gameplay commits (e.g. this agent/skill setup) — changelog is for players, not contributors.
- Don't write changelog entries before a feature is actually working and committed.
