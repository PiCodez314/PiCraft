import { world } from "@minecraft/server";

const SCROLL_ID = "picraft:teleport_scroll";
const MAX_BLINK_DISTANCE = 10;
const STEP_BACK = 0.25;

function isClearAt(dimension, location) {
    const feetY = Math.floor(location.y);
    const feet = dimension.getBlock({ x: location.x, y: feetY, z: location.z });
    const head = dimension.getBlock({ x: location.x, y: feetY + 1, z: location.z });
    const ground = dimension.getBlock({ x: location.x, y: feetY - 1, z: location.z });
    if (!feet || !head || !ground) {
        return false;
    }
    const feetClear = feet.isAir && !feet.isLiquid;
    const headClear = head.isAir && !head.isLiquid;
    const groundSolid = !ground.isAir && !ground.isLiquid;
    return feetClear && headClear && groundSolid;
}

function findSafeBlinkDestination(player) {
    const dimension = player.dimension;
    const eyeLocation = player.getHeadLocation();
    const viewDirection = player.getViewDirection();

    const hit = player.getBlockFromViewDirection({
        maxDistance: MAX_BLINK_DISTANCE,
        includeLiquidBlocks: false,
        includePassableBlocks: false,
    });

    let maxDistance = MAX_BLINK_DISTANCE;
    if (hit) {
        const dx = hit.block.location.x - eyeLocation.x;
        const dy = hit.block.location.y - eyeLocation.y;
        const dz = hit.block.location.z - eyeLocation.z;
        maxDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    const checkedColumns = new Set();
    for (let distance = maxDistance; distance > 0; distance -= STEP_BACK) {
        const candidate = {
            x: eyeLocation.x + viewDirection.x * distance,
            y: eyeLocation.y + viewDirection.y * distance,
            z: eyeLocation.z + viewDirection.z * distance,
        };

        const columnKey = `${Math.floor(candidate.x)},${Math.floor(candidate.y)},${Math.floor(candidate.z)}`;
        if (checkedColumns.has(columnKey)) {
            continue;
        }
        checkedColumns.add(columnKey);

        if (isClearAt(dimension, candidate)) {
            return { x: candidate.x, y: Math.floor(candidate.y), z: candidate.z };
        }
    }

    return undefined;
}

world.afterEvents.itemUse.subscribe((event) => {
    const { source: player, itemStack } = event;
    if (itemStack.typeId !== SCROLL_ID) {
        return;
    }

    const destination = findSafeBlinkDestination(player);
    if (!destination) {
        return;
    }

    const teleported = player.tryTeleport(destination, {
        checkForBlocks: true,
        dimension: player.dimension,
        keepVelocity: false,
    });
    if (!teleported) {
        return;
    }

    const inventory = player.getComponent("minecraft:inventory");
    const slot = inventory?.container?.getSlot(player.selectedSlotIndex);
    if (!slot) {
        return;
    }

    if (slot.amount <= 1) {
        slot.setItem(undefined);
    } else {
        slot.amount -= 1;
    }
});
