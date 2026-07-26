import { world } from "@minecraft/server";

const LUCKY_BLOCK_ID = "picraft:lucky_block";

const MOB_POOL = [
    "minecraft:chicken",
    "minecraft:pig",
    "minecraft:villager_v2",
    "minecraft:cow",
    "minecraft:zombie",
    "minecraft:spider",
    "minecraft:skeleton",
];

world.afterEvents.playerBreakBlock.subscribe((event) => {
    if (event.brokenBlockPermutation.type.id !== LUCKY_BLOCK_ID) {
        return;
    }

    const { dimension, block } = event;
    const spawnPos = { x: block.location.x + 0.5, y: block.location.y + 1, z: block.location.z + 0.5 };
    const mobId = MOB_POOL[Math.floor(Math.random() * MOB_POOL.length)];

    dimension.spawnEntity(mobId, spawnPos);
});
