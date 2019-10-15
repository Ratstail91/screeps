/* DOCS: spawn.crash
 * Handle colony crash events
*/

const { STAGE_2_ENERGY_CAPACITY } = require("constants");
const { getCreepsByOrigin, getPopulationByTags } = require("spawns.utils");
const { spawnCreep } = require("creeps");

const {
	PICKUP, DEPOSIT, HARVEST, UPGRADE, BUILD, REPAIR,
} = require("behaviour_names");

//assume 300e available - tinybody is 250e
const tinyBody = [CARRY, WORK, MOVE, MOVE];

function spawnHasCrashed(spawn) {
	creeps = getCreepsByOrigin(spawn);

	//TODO: handle different RCL levels and external pressures, and exclude mappers

	if (creeps.length < 5 && spawn.room.energyCapacityAvailable >= STAGE_2_ENERGY_CAPACITY) {
		return true;
	} else {
		Memory._crashHandler = false;
	}
}

function spawnHandleCrash(spawn) {
	if (!Memory._crashHandler) {
		Memory._crashHandler = true;
		const msg = `Crash detected at ${spawn.name}, beginning recovery`;
		Game.notify(msg);
		console.log(`<div style="color:red">${msg}</div>`)
	}

	creeps = getCreepsByOrigin(spawn);
	tags = getPopulationByTags(creeps);

	//spawn harvesters
	if (!tags.harvester || tags.harvester < 2) {
		return spawnCreep(spawn, "harvester", ["harvester", "crash"], [PICKUP, DEPOSIT, HARVEST, UPGRADE], tinyBody);
	}

	//spawn upgraders
	if (!tags.upgrader || tags.upgrader < 2) {
		return spawnCreep(spawn, "upgrader", ["upgrader", "crash"], [PICKUP, HARVEST, UPGRADE], tinyBody);
	}

	//spawn builders/repairers
	if (!tags.builder || tags.builder < 1) {
		return spawnCreep(spawn, "builder", ["builder", "crash"], [REPAIR, BUILD, HARVEST, UPGRADE], tinyBody);
	}
}

module.exports = {
	spawnHasCrashed,
	spawnHandleCrash,
};
