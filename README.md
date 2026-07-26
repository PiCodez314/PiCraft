# PiCraft

A Minecraft Bedrock add-on created for family LAN adventures.

## Goals

- Custom items
- Magic
- Lucky Blocks
- Bosses
- Family achievements
- Quests

Version 0.1.0

## Getting started (designing with Claude Code)

This repo is set up to work with [Claude Code](https://claude.com/product/claude-code) — it already knows the project structure, past gotchas, and has a repeatable process for adding new content.

1. Install Claude Code and open it in this repo folder.
2. Do the one-time [Development setup](#development-setup) below (symlinks) so you can test in-game.
3. To add something new — an item, block, mob, boss, quest, whatever — just ask for it in plain language, e.g. "add a new sword that shoots lightning" or "add a boss fight in the nether." Claude Code will ask a few questions about how it should work, then build it, generate placeholder art, check its own work, and tell you when to relaunch Minecraft to test it.
4. When something's ready to share, ask Claude Code to "package a release" to produce an `.mcaddon` file in `Releases/`.

Everything it needs to do this well lives in `.claude/` (skills + specialized helper agents) and `.claude/CLAUDE.md` (project notes and lessons learned) — already part of this repo, nothing extra to set up.

### Idea starters — things you can just ask for

Not sure what to build first? Pick one and describe it in your own words — Claude Code will fill in the details with you.

#### Stuff you hold or wear

- A weapon or tool with a special power (extra damage, sets things on fire, knocks enemies back)
- A wearable item that gives you an effect while worn (speed boots, night-vision goggles)
- A magic item with a cooldown (wand, scroll, staff — see the fireball wand/grapple hook/teleport scroll already in this pack)

#### Blocks

- A block that does something surprising when broken or right-clicked (like the Lucky Block already in this pack)
- A block that gives off light, sound, or particles when placed

#### Creatures

- A tameable/rideable pet (like the pet dragon already in this pack)
- A friendly mob that trades or gives quests
- A boss fight with its own arena, attacks, and phases

#### Progression

- A crafting recipe that turns basic materials into something special
- A quest chain — a series of steps that unlock a reward at the end
- A family achievement — a fun milestone (built or found something) that gets recognized in-game

#### Look & feel

- Sound effects or particle effects for an item, spell, or block
- An in-game menu — like a shop, or a "pick your spell" list
- Custom loot in chests you find while exploring

#### Packaging

- "Package a release" — turns everything built so far into a shareable `.mcaddon` file

## Development setup

To test changes in-game, Minecraft needs to load the packs directly from this repo instead of a copy. Create symlinks from Minecraft's dev pack folders to this repo's `PiCraft/behavior_pack` and `PiCraft/resource_pack` directories.

Find your `com.mojang` folder, usually at:

```text
%LOCALAPPDATA%\Packages\Microsoft.MinecraftUWP_8wekyb3d8bbwe\LocalState\games\com.mojang
```

If that doesn't exist, check `%APPDATA%\Minecraft Bedrock\Users\Shared\games\com.mojang` instead — some installs read dev pack availability from there rather than the per-user profile folder.

In an **elevated** PowerShell (symlink creation requires admin rights unless Developer Mode is enabled), run:

```powershell
New-Item -ItemType SymbolicLink -Path "<com.mojang>\development_behavior_packs\PiCraft" -Target "<repo path>\PiCraft\behavior_pack"
New-Item -ItemType SymbolicLink -Path "<com.mojang>\development_resource_packs\PiCraft" -Target "<repo path>\PiCraft\resource_pack"
```

Replacing `<com.mojang>` and `<repo path>` with your actual paths.

After creating the symlinks, fully close and relaunch Minecraft, then activate both packs from the world's settings (Behavior Packs / Resource Packs).
