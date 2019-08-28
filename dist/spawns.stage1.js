/* DOCS: stage 1
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

//assume 300e available - tinybody is 250e
const tinyBody = [CARRY, WORK, MOVE, MOVE];

function run(spawn) {
	creeps = getCreepsByOrigin(spawn);
	tags = getPopulationByTags(creeps);

	//begin upgrading to the next stage
	if (spawn.room.controller.level >= 2) {
		//spawn builders/repairers
		if (!tags.builder || tags.builder < 4) {
			return spawnCreep(spawn, "builder", ["builder"], [REPAIR, BUILD, HARVEST, UPGRADE], tinyBody);
		}

		//place the construction sites every so often
		if (Game.time % 20 == 0) {
//			schematicBuild(spawn, "schematic.defense");
			schematicBuild(spawn, "schematic.extensions");
//			schematicBuild(spawn, "schematic.infrastructure");
		}
	}

	//spawn harvesters
	if (!tags.harvester || tags.harvester < 2) {
		return spawnCreep(spawn, "harvester", ["harvester"], [PICKUP, DEPOSIT, HARVEST, UPGRADE], tinyBody);
	}

	//spawn upgraders
	if (!tags.upgrader || tags.upgrader < 2) {
		return spawnCreep(spawn, "upgrader", ["upgrader"], [PICKUP, HARVEST, UPGRADE], tinyBody);
	}
}

module.exports = run;
