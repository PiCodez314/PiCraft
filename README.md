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

Notes:

- The repo must live on an **NTFS** drive. Minecraft (a Store/UWP app) cannot reliably read symlinked files on ReFS volumes.
- If Minecraft can't see the packs at all ("you don't own any packs yet"), the UWP app sandbox may need explicit read access to the repo folder and to the `Minecraft Bedrock` folder tree:

  ```powershell
  icacls "<repo path>" /grant "*S-1-15-2-1:(OI)(CI)(RX)" /T /C
  icacls "<repo path>" /grant "*S-1-15-2-2:(OI)(CI)(RX)" /T /C
  ```

- After creating the symlinks, fully close and relaunch Minecraft, then activate both packs from the world's settings (Behavior Packs / Resource Packs).
