import { world } from "@minecraft/server";

const HOOK_ID = "picraft:grapple_hook";
const PULL_STRENGTH = 2.8;

world.afterEvents.itemUse.subscribe((event) => {
    const { source: player, itemStack } = event;
    if (itemStack.typeId !== HOOK_ID) {
        return;
    }

    const direction = player.getViewDirection();
    player.applyKnockback(
        { x: direction.x * PULL_STRENGTH, z: direction.z * PULL_STRENGTH },
        direction.y * PULL_STRENGTH + 0.2
    );
});
