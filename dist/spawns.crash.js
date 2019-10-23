/* DOCS: spawns.crash
 * Handle colony crash events
*/

const {
	STAGE_2_ENERGY_CAPACITY,
} = require("constants");

const { getCreepsByOrigin, getPopulationByTags } = require("spawns.utils");
const { spawnCreep } = require("creeps");

const {
	PICKUP, DEPOSIT, HARVEST, UPGRADE, BUILD, REPAIR,
} = require("behaviour_names");

//assume 300e available - tinybody is 250e
const tinyBody = [CARRY, WORK, MOVE, MOVE];

function spawnHasCrashed(spawn) {
	creeps = getCreepsByOrigin(spawn);

	if (creeps.length < 5 && spawn.room.energyCapacityAvailable >= STAGE_2_ENERGY_CAPACITY) {
		return true;
	} else {
		Memory.spawns[spawn.name]._crashHandler = false;
	}
}

function spawnHandleCrash(spawn) {
	if (!Memory.spawns[spawn.name]._crashHandler) {
		Memory.spawns[spawn.name]._crashHandler = true;
		const msg = `Crash detected at ${spawn.name}, beginning recovery`;
		Game.notify(msg);
		console.log(`<div style="color:red">${msg}</div>`);

		//full reset if no crash tags are present
		const c = getCreepsByOrigin(spawn);
		const s = c.some(c => c.memory.tags.indexOf('crash') != -1);
		if (!s) {
			c.filter(c => c.memory.tags.indexOf('nocrash') != -1).forEach(c => c.suicide());
		}
	}

	creeps = getCreepsByOrigin(spawn);
	tags = getPopulationByTags(creeps);

	//spawn harvesters
	if (!tags.harvester || tags.harvester < 3) {
		return spawnCreep(spawn, "harvester", ["harvester", "crash"], [PICKUP, DEPOSIT, HARVEST, UPGRADE], tinyBody, {
			HARVEST: {
				remote: 0,
				source: null
			}
		});
	}

	//spawn upgraders
	if (!tags.upgrader || tags.upgrader < 1) {
		return spawnCreep(spawn, "upgrader", ["upgrader", "crash"], [PICKUP, HARVEST, UPGRADE], tinyBody, {
			HARVEST: {
				remote: 0,
				source: null
			}
		});
	}

	//spawn builders/repairers
	if (!tags.builder || tags.builder < 1) {
		return spawnCreep(spawn, "builder", ["builder", "crash"], [REPAIR, BUILD, HARVEST, UPGRADE], tinyBody, {
			HARVEST: {
				remote: 0,
				source: null
			}
		});
	}
}

module.exports = {
	spawnHasCrashed,
	spawnHandleCrash,
};
