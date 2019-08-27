/* DOCS: stage 1
 * The main priority at this stage is to grow as fast as possible.
 * This spawns a few simple harvesters and upgraders.
*/

const { STAGE_1_ENERGY_CAPACITY: ENERGY_CAPACITY } = require("constants");
const { getCreepsByOrigin, getPopulationByTags } = require("spawns.utils");
const { spawnCreep } = require("creeps");

const {
	DEPOSIT, HARVEST, UPGRADE, BUILD, REPAIR
} = require("behaviour_names");

const { schematicBuild } = require("schematic");

//assume 300e available - tinybody is 250e
const tinyBody = [MOVE, MOVE, WORK, CARRY];

function run(spawn) {
	creeps = getCreepsByOrigin(spawn);
	tags = getPopulationByTags(creeps);

	//spawn harvesters
	if (!tags.harvester || tags.harvester < 2) {
		spawnCreep(spawn, "harvester", ["harvester"], [DEPOSIT, HARVEST, UPGRADE], tinyBody);
	}

	//spawn upgraders
	if (!tags.upgrader || tags.upgrader < 2) {
		spawnCreep(spawn, "upgrader", ["upgrader"], [HARVEST, UPGRADE], tinyBody);
	}

	//begin upgrading to the next stage
	if (spawn.room.controller.level >= 2) {
		//spawn builders/repairers
		if (!tags.builder || tags.builder < 4) {
			spawnCreep(spawn, "builder", ["builder"], [REPAIR, BUILD, HARVEST], tinyBody);
		}

		//place the construction sites every so often
		if (Game.time % 20 == 0) {
			let schematicResult = schematicBuild(spawn, "schematic.stage1");

			if (schematicResult != 0) {
				throw new Error(`Invalid schematic count: ${schematicResult}`); //TODO: build elsewhere
			}
		}
	}
}

module.exports = run;
