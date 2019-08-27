/* DOCS: stage 1
 * The main priority at this stage is to grow as fast as possible.
 * This spawns a few simple harvesters and upgraders.
*/

const { STAGE_1_ENERGY_CAPACITY: ENERGY_CAPACITY } = require("constants");
const { getCreepsByOrigin, getPopulationByTags } = require("spawns.utils");
const { spawnCreep } = require("creeps");

const {
	DEPOSIT, HARVEST, UPGRADE
} = require("behaviour_names");

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
}

module.exports = run;
