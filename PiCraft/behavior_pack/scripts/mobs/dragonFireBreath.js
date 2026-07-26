import { world, system } from "@minecraft/server";

const DRAGON_ID = "picraft:dragon";
const COOLDOWN_TICKS = 60; // 3 seconds
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

function breathFire(dragon, excludeEntity) {
    lastBreathTick.set(dragon.id, system.currentTick);

    const view = dragon.getViewDirection();
    const yaw = (Math.atan2(-view.x, view.z) * 180) / Math.PI;

    const targets = dragon.dimension.getEntities({
        location: dragon.location,
        maxDistance: BREATH_RANGE,
        minHorizontalRotation: yaw - BREATH_HALF_ANGLE,
        maxHorizontalRotation: yaw + BREATH_HALF_ANGLE,
        excludeFamilies: ["dragon"],
    });

    for (const target of targets) {
        if (target === excludeEntity) {
            continue;
        }
        target.applyDamage(BREATH_DAMAGE, { cause: "fire", damagingEntity: dragon });
        target.setOnFire(BREATH_FIRE_SECONDS, true);
    }

    dragon.dimension.spawnParticle("minecraft:blaze_particles", {
        x: dragon.location.x + view.x,
        y: dragon.location.y + 1.5,
        z: dragon.location.z + view.z,
    });
}

const DIMENSION_IDS = ["overworld", "nether", "the_end"];

system.runInterval(() => {
    for (const dimensionId of DIMENSION_IDS) {
        const dimension = world.getDimension(dimensionId);
        for (const dragon of dimension.getEntities({ type: DRAGON_ID })) {
            if (!offCooldown(dragon)) {
                continue;
            }

            const riders = dragon.getComponent("minecraft:rideable")?.getRiders() ?? [];
            const rider = riders[0];

            if (rider) {
                if (rider.isSneaking) {
                    breathFire(dragon, rider);
                }
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
