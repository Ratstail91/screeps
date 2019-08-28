/* DOCS: stage 3
 * The main priority at this stage is to grow, and to map out the surrounding rooms.
*/

const { STAGE_1_ENERGY_CAPACITY: ENERGY_CAPACITY } = require("constants");
const { getCreepsByOrigin, getPopulationByTags } = require("spawns.utils");
const { spawnCreep } = require("creeps");

const {
	PICKUP, DEPOSIT, HARVEST, UPGRADE, BUILD, REPAIR,
	RECORD, EXPLORE, WANDER,
} = require("behaviour_names");

const { schematicBuild } = require("schematic");

//assume 800 is available - medium body is 800e
const mediumBody = [ //800
	CARRY, CARRY, CARRY, CARRY, CARRY, WORK, WORK,
	MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
];

//scout body is 240
const scoutBody = [
	TOUGH, TOUGH, TOUGH, TOUGH,
	MOVE, MOVE, MOVE, MOVE
];

function run(spawn) {
	creeps = getCreepsByOrigin(spawn);
	tags = getPopulationByTags(creeps);

	//an upper limit on units by type
	let upperLimit = 4;

	//begin upgrading to the next stage
	if (spawn.room.controller.level >= 3) {
		//TODO
	}

	//spawn harvesters
	if (!tags.harvester || tags.harvester < upperLimit) {
		spawnCreep(spawn, "harvester", ["harvester"], [PICKUP, DEPOSIT, HARVEST, UPGRADE], mediumBody);
	}

	//spawn upgraders
	if (!tags.upgrader || tags.upgrader < upperLimit) {
		spawnCreep(spawn, "upgrader", ["upgrader"], [PICKUP, HARVEST, UPGRADE], mediumBody);
	}

	//spawn builders/repairers
	if (!tags.builder || tags.builder < 1) {
		spawnCreep(spawn, "builder", ["builder"], [REPAIR, BUILD, HARVEST, UPGRADE], mediumBody);
	}

	//spawn scouts
	if (!tags.scout || tags.scout < 4) {
		spawnCreep(spawn, "scout", ["scout"], [RECORD, EXPLORE, WANDER], scoutBody);
	}
}

module.exports = run;
