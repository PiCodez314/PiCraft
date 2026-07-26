import { world } from "@minecraft/server";

const WAND_ID = "picraft:fireball_wand";
const LAUNCH_SPEED = 1.5;
const EXPLOSION_RADIUS = 2;

const activeFireballIds = new Set();

world.afterEvents.itemUse.subscribe((event) => {
    const { source: player, itemStack } = event;
    if (itemStack.typeId !== WAND_ID) {
        return;
    }

    const direction = player.getViewDirection();
    const spawnPos = {
        x: player.location.x + direction.x,
        y: player.location.y + 1.5,
        z: player.location.z + direction.z,
    };

    const arrow = player.dimension.spawnEntity("minecraft:arrow", spawnPos);
    activeFireballIds.add(arrow.id);
    arrow.setOnFire(10, false);

    const projectile = arrow.getComponent("minecraft:projectile");
    if (projectile) {
        projectile.owner = player;
        projectile.shoot({
            x: direction.x * LAUNCH_SPEED,
            y: direction.y * LAUNCH_SPEED,
            z: direction.z * LAUNCH_SPEED,
        });
    }
});

function explodeAtProjectile(dimension, location, projectile) {
    if (!activeFireballIds.has(projectile.id)) {
        return;
    }
    activeFireballIds.delete(projectile.id);

    dimension.createExplosion(location, EXPLOSION_RADIUS, {
        breaksBlocks: false,
        causesFire: false,
        allowUnderwater: false,
    });
}

world.afterEvents.projectileHitBlock.subscribe((event) => {
    explodeAtProjectile(event.dimension, event.location, event.projectile);
});

world.afterEvents.projectileHitEntity.subscribe((event) => {
    explodeAtProjectile(event.dimension, event.location, event.projectile);
});
