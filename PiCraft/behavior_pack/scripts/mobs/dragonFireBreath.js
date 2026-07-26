import { world, system } from "@minecraft/server";

const DRAGON_ID = "picraft:dragon";
const COOLDOWN_TICKS = 40; // 2 seconds
const BREATH_RANGE = 12;
const BREATH_HALF_ANGLE = 20; // degrees either side of forward
const BREATH_DAMAGE = 6;
const BREATH_FIRE_SECONDS = 5;
const AUTO_DEFEND_RANGE = 10;

const lastBreathTick = new Map();

function offCooldown(dragon) {
    const last = lastBreathTick.get(dragon.id) ?? -Infinity;
    return system.currentTick - last >= COOLDOWN_TICKS;
}

const BREATH_COS_HALF_ANGLE = Math.cos((BREATH_HALF_ANGLE * Math.PI) / 180);
const BREATH_MOUTH_HEIGHT = 1.5;
const BREATH_STREAM_STEP = 0.25; // blocks between particles along the stream

// Body yaw (getRotation().y), not getViewDirection() (head aim) - a mob's
// head can rotate independently of its body/movement facing.
function forwardFromYaw(yawDegrees) {
    const yawRadians = (yawDegrees * Math.PI) / 180;
    return { x: -Math.sin(yawRadians), z: Math.cos(yawRadians) };
}

function isInBreathCone(dragon, forward, target) {
    const dx = target.location.x - dragon.location.x;
    const dz = target.location.z - dragon.location.z;
    const dist = Math.hypot(dx, dz);
    if (dist < 0.001) {
        return true;
    }
    const dot = (forward.x * dx + forward.z * dz) / dist;
    return dot >= BREATH_COS_HALF_ANGLE;
}

const BREATH_STREAM_THICKNESS = 0.35; // spread radius for the cluster at each step

function spawnBreathStream(dragon, mouth, forward, length) {
    for (let d = 0; d <= length; d += BREATH_STREAM_STEP) {
        const cx = mouth.x + forward.x * d;
        const cy = mouth.y + forward.y * d;
        const cz = mouth.z + forward.z * d;
        // Cluster a few particles around the center point per step so the
        // stream reads as a thicker jet of fire instead of a thin line.
        for (let i = 0; i < 4; i++) {
            dragon.dimension.spawnParticle("minecraft:basic_flame_particle", {
                x: cx + (Math.random() - 0.5) * BREATH_STREAM_THICKNESS,
                y: cy + (Math.random() - 0.5) * BREATH_STREAM_THICKNESS,
                z: cz + (Math.random() - 0.5) * BREATH_STREAM_THICKNESS,
            });
        }
    }
}

function breathFire(dragon, excludeEntity, rider) {
    lastBreathTick.set(dragon.id, system.currentTick);

    // Horizontal cone/targeting uses body yaw (stable, ignores head twitch).
    // Vertical aim follows the rider's own view direction, not the dragon's -
    // the dragon's head is driven by minecraft:behavior.look_at_player, which
    // fights any attempt to read the dragon's own head pitch as "aim".
    const forward = forwardFromYaw(dragon.getRotation().y);
    const aim = rider ? rider.getViewDirection() : dragon.getViewDirection();
    const mouth = {
        x: dragon.location.x + forward.x,
        y: dragon.location.y + BREATH_MOUTH_HEIGHT,
        z: dragon.location.z + forward.z,
    };

    const candidates = dragon.dimension.getEntities({
        location: dragon.location,
        maxDistance: BREATH_RANGE,
        excludeFamilies: ["dragon"],
    });

    const targets = candidates.filter((target) => isInBreathCone(dragon, forward, target));

    let streamLength = 4; // visible even if nothing is hit
    for (const target of targets) {
        if (target === excludeEntity) {
            continue;
        }
        const dx = target.location.x - dragon.location.x;
        const dz = target.location.z - dragon.location.z;
        streamLength = Math.max(streamLength, Math.hypot(dx, dz));

        target.applyDamage(BREATH_DAMAGE, { cause: "fire", damagingEntity: dragon });
        if (target.isValid) {
            target.setOnFire(BREATH_FIRE_SECONDS, true);
        }
    }

    spawnBreathStream(dragon, mouth, aim, streamLength);
}

// Rider-triggered: swinging (attack input) while mounted on a dragon breathes
// fire. Sneak can't be used for this - Bedrock dismounts the rider on sneak
// and there's no documented way to suppress that for minecraft:rideable.
world.afterEvents.playerSwingStart.subscribe((event) => {
    const player = event.player;
    const riding = player.getComponent("minecraft:riding");
    const dragon = riding?.entityRidingOn;
    if (!dragon || dragon.typeId !== DRAGON_ID) {
        return;
    }
    if (!offCooldown(dragon)) {
        return;
    }
    breathFire(dragon, player, player);
});

// Auto-defense: an unridden dragon breathes fire at nearby hostiles.
const DIMENSION_IDS = ["overworld", "nether", "the_end"];

system.runInterval(() => {
    for (const dimensionId of DIMENSION_IDS) {
        const dimension = world.getDimension(dimensionId);
        for (const dragon of dimension.getEntities({ type: DRAGON_ID })) {
            if (!offCooldown(dragon)) {
                continue;
            }

            const riders = dragon.getComponent("minecraft:rideable")?.getRiders() ?? [];
            if (riders.length > 0) {
                continue;
            }

            const hostiles = dragon.dimension.getEntities({
                location: dragon.location,
                maxDistance: AUTO_DEFEND_RANGE,
                families: ["monster"],
            });
            if (hostiles.length > 0) {
                breathFire(dragon, undefined);
            }
        }
    }
}, 5);
