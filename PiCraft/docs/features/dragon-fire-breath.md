# Dragon fire breath

Adds a fire-breath ability to the existing pet dragon (`picraft:dragon`).

## Behavior

- **While ridden**: rider swings (attack input) to trigger a breath attack in the direction the dragon is facing. Sneak was the original plan but Bedrock dismounts the rider on sneak with no documented suppression — see Lessons learned.
- **While not ridden**: dragon auto-defends by breathing fire whenever a hostile mob (`monster` family) comes within 10 blocks.
- **Effect**: no projectile — directly damages (6 HP) and ignites (5s) entities in a ~20°-either-side cone, up to 12 blocks in front of the dragon, computed via a manual dot-product cone check against the dragon's **body yaw** (`getRotation().y`), not `getViewDirection()` — see Lessons learned.
- **Visual**: a stream of `minecraft:basic_flame_particle` spawned every 0.25 blocks from the dragon's mouth out to the farthest hit target (minimum 4 blocks so it's visible even on a whiff) — reads as a flame jet coming from the dragon, not just a burst at the target. The original single-particle-at-the-target version didn't visibly connect to the dragon; this was a deliberate follow-up fix after in-game testing. Each step spawns a small random-offset cluster of 4 particles (±0.35 blocks) rather than one point, since `basic_flame_particle` has no size parameter — clustering is the practical way to make the jet look thicker.
- **Vertical aim**: the stream's direction uses the **rider's** `getViewDirection()` when ridden (not the dragon's) — the dragon's own head is driven by `minecraft:behavior.look_at_player` and fights any attempt to read the dragon's head pitch as "aim" (looking up while riding didn't angle the breath up, only down partly worked, until this fix). When unridden (auto-defense), falls back to the dragon's own view direction. Horizontal *targeting* still uses body yaw, not view direction, to keep the cone stable regardless of head twitch (see Lessons learned on `getViewDirection()` vs body yaw). Note: hit-detection (`isInBreathCone`) is still horizontal-only — a target well above/below the dragon won't be damaged even though the stream visually points at it. Acceptable for v1; revisit if it matters in practice.
- **Cooldown**: 40 ticks (2s) per dragon instance, tracked in-memory (resets on world reload — acceptable for this scope).

## Files

- `PiCraft/behavior_pack/scripts/mobs/dragonFireBreath.js` — all logic. Rider trigger is event-driven (`world.afterEvents.playerSwingStart`); auto-defense polls every 5 ticks via `system.runInterval` across overworld/nether/the_end.
- `PiCraft/behavior_pack/scripts/main.js` — added import.
- No changes to `dragon.json` — reuses the existing `minecraft:rideable` component (`getRiders()`) for the auto-defense "am I ridden" check, and `minecraft:riding` on the player side (`entityRidingOn`) for the swing-trigger's "is this player riding a dragon" check.

## Key API facts (verified, not guessed)

- `world.afterEvents.playerSwingStart` fires on the swing action itself, independent of whether it connects with anything — needed since a mounted player swinging at open air won't hit an entity. Event exposes `.player` directly.
- `player.getComponent("minecraft:riding")` returns an `EntityRidingComponent` with `.entityRidingOn: Entity` — the correct way to check what a player is currently mounted on. Distinct from `minecraft:rideable` (lives on the mount, exposes `.getRiders()`).
- `entity.applyDamage(amount, { cause, damagingEntity })` and `entity.setOnFire(seconds, useEffects)` are the correct calls (seconds, not ticks). Guard `setOnFire` with `target.isValid` (a read-only property, not a method) after `applyDamage` — damage can remove/kill the entity, and calling `setOnFire` on an already-invalid entity throws `InvalidEntityError` (hit this in testing).
- `dimension.getEntities()` supports `minHorizontalRotation`/`maxHorizontalRotation`, but those values aren't auto-normalized — passing a computed yaw ± half-angle that exceeds ±180° throws `CommandError: Rotation out of range` at runtime (hit this in testing). Switched to a manual dot-product cone check instead, which sidesteps the wraparound entirely and needs no clamping.
- No single API queries entities across all dimensions at once — the script loops the three known dimension IDs explicitly.

## Open scope decisions (v1)

- Cooldown state is in-memory (`Map`), not a dynamic property — fine for this feature since a stale cooldown after reload just means the ability is available a bit early/late, not broken.
- Single-rider assumption (dragon only seats 1 anyway).
- Auto-defense targets any `monster`-family entity in range — no line-of-sight or friendly-fire exclusion beyond excluding the dragon's own family.
