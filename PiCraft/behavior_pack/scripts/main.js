import {world} from "@minecraft/server";
import "./items/luckyBlock.js";

world.afterEvents.playerSpawn.subscribe((event) => {
    if (event.initialSpawn) {
        world.sendMessage(`Welcome to PiWorld, ${event.player.name}!`);
    }
});