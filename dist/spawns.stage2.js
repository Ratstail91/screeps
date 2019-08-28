/* DOCS: stage 2
 * The main priority at this stage is to grow as fast as possible.
 * This spawns a few simple harvesters and upgraders.
*/

const { STAGE_1_ENERGY_CAPACITY: ENERGY_CAPACITY } = require("constants");
const { getCreepsByOrigin, getPopulationByTags } = require("spawns.utils");
const { spawnCreep } = require("creeps");

const {
	PICKUP, DEPOSIT, HARVEST, UPGRADE, BUILD, REPAIR,
} = require("behaviour_names");

const { schematicBuild } = require("schematic");

//assume 550 is available - small body is 500e
const smallBody = [CARRY, CARRY, WORK, WORK, MOVE, MOVE, MOVE, MOVE];

function run(spawn) {
	creeps = getCreepsByOrigin(spawn);
	tags = getPopulationByTags(creeps);

	//an upper limit on units by type
	let upperLimit = 4;

	//begin upgrading to the next stage
	if (spawn.room.controller.level >= 3) {
		upperLimit = 2; //shift this downwards to give builders enough room

		//spawn builders/repairers en-masse
		if (!tags.builder || tags.builder < 4) {
			return spawnCreep(spawn, "builder", ["builder"], [REPAIR, BUILD, HARVEST, UPGRADE], smallBody);
		}

		//place the construction sites every so often
		if (Game.time % 20 == 0) {
			schematicBuild(spawn, "schematic.defense");
			schematicBuild(spawn, "schematic.extensions");
//			schematicBuild(spawn, "schematic.infrastructure");
		}
	}

	//spawn harvesters
	if (!tags.harvester || tags.harvester < upperLimit) {
		return spawnCreep(spawn, "harvester", ["harvester"], [PICKUP, DEPOSIT, HARVEST, UPGRADE], smallBody);
	}

	//spawn upgraders
	if (!tags.upgrader || tags.upgrader < upperLimit) {
		return spawnCreep(spawn, "upgrader", ["upgrader"], [PICKUP, HARVEST, UPGRADE], smallBody);
	}

	//spawn builders/repairers
	if (!tags.builder || tags.builder < 1) {
		return spawnCreep(spawn, "builder", ["builder"], [REPAIR, BUILD, HARVEST, UPGRADE], smallBody);
	}
}

module.exports = run;