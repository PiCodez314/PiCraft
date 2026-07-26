import {world} from "@minecraft/server";
import "./items/luckyBlock.js";
import "./magic/fireballWand.js";
import "./magic/grappleHook.js";
import "./magic/teleportScroll.js";
import "./mobs/dragonFireBreath.js";

world.afterEvents.playerSpawn.subscribe((event) => {
    if (event.initialSpawn) {
        world.sendMessage(`Welcome to PiWorld, ${event.player.name}!`);
    }
});