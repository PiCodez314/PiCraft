# Dragon fire breath

Adds a fire-breath ability to the existing pet dragon (`picraft:dragon`).

## Behavior

- **While ridden**: rider sneaks to trigger a breath attack in the direction the dragon is facing.
- **While not ridden**: dragon auto-defends by breathing fire whenever a hostile mob (`monster` family) comes within 10 blocks.
- **Effect**: no projectile — directly damages (6 HP) and ignites (5s) entities in a ~20°-either-side cone, up to 12 blocks in front of the dragon, computed via `dimension.getEntities()`'s rotation filters. A blaze particle spawns at the dragon's mouth for visual feedback.
- **Cooldown**: 60 ticks (3s) per dragon instance, tracked in-memory (resets on world reload — acceptable for this scope).

## Files

- `PiCraft/behavior_pack/scripts/mobs/dragonFireBreath.js` — all logic; polls every 5 ticks via `system.runInterval` across overworld/nether/the_end.
- `PiCraft/behavior_pack/scripts/main.js` — added import.
- No changes to `dragon.json` — reuses the existing `minecraft:rideable` component to find the current rider; no new events/component groups needed.

## Key API facts (verified, not guessed)

- No dedicated "mounted rider input" event exists in current Script API — polling `Player.isSneaking` every tick is the standard pattern, mounted or not.
- `entity.applyDamage(amount, { cause, damagingEntity })` and `entity.setOnFire(seconds, useEffects)` are the correct calls (seconds, not ticks).
- `dimension.getEntities()` supports `minHorizontalRotation`/`maxHorizontalRotation` directly, which was used for the cone filter instead of manual vector math.
- No single API queries entities across all dimensions at once — the script loops the three known dimension IDs explicitly.

## Open scope decisions (v1)

- Cooldown state is in-memory (`Map`), not a dynamic property — fine for this feature since a stale cooldown after reload just means the ability is available a bit early/late, not broken.
- Single-rider assumption (dragon only seats 1 anyway).
- Auto-defense targets any `monster`-family entity in range — no line-of-sight or friendly-fire exclusion beyond excluding the dragon's own family.
