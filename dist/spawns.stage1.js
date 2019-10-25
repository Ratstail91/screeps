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

function run(spawn, crash) {
	creeps = getCreepsByOrigin(spawn);
	tags = getPopulationByTags(creeps);

	//begin upgrading to the next stage
	if (spawn.room.controller.level >= 2 && !crash) {
		//place the construction sites every so often
		if (Game.time % 20 == 0) {
			if (schematicBuild(spawn, "schematic.extensions") != 0) {
				Game.notify("schematicBuild returned a non-zero value (extensions stage 1)");
			}
		}

		//spawn builders/repairers
		if (!tags.builder || tags.builder < 4) {
			return spawnCreep(spawn, "builder", ["builder"], [REPAIR, BUILD, HARVEST, UPGRADE], tinyBody, {
				HARVEST: {
					remote: 0,
					source: null,
					skipOnFull: true,
				}
			});
		}
	}

	//spawn harvesters
	if (!tags.harvester || tags.harvester < 2) {
		return spawnCreep(spawn, "harvester", ["harvester"], [PICKUP, DEPOSIT, HARVEST, UPGRADE], tinyBody);
	}

	//spawn upgraders
	if (!tags.upgrader || tags.upgrader < 2) {
		return spawnCreep(spawn, "upgrader", ["upgrader"], [PICKUP, HARVEST, UPGRADE], tinyBody, {
			HARVEST: {
				skipOnFull: true,
			}
		});
	}
}

const profiler = require('screepers.profiler');

module.exports = profiler.registerFN(run, "spawns.stage1");
