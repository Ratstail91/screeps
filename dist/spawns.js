const {
	STAGE_1_ENERGY_CAPACITY,
	STAGE_2_ENERGY_CAPACITY,
	STAGE_3_ENERGY_CAPACITY,
	STAGE_4_ENERGY_CAPACITY,
	STAGE_5_ENERGY_CAPACITY,
	STAGE_6_ENERGY_CAPACITY,
} = require("constants");

const spawnStage1 = require("spawns.stage1");
const spawnStage2 = require("spawns.stage2");
const spawnStage3 = require("spawns.stage3");
//const spawnStage4 = require("spawns.stage4");
//const spawnStage5 = require("spawns.stage5");
//const spawnStage6 = require("spawns.stage6");

const { spawnHasCrashed, spawnHandleCrash } = require("spawns.crash");

/* DOCS: handleSpawn(spawn)
 * Handles the AI for "spawn"
*/
function handleSpawn(spawn) {
	//skip this spawn if it's spawning
	if (spawn.spawning) {
		return;
	}

	//handle crashes, etc.
	if (spawnHasCrashed(spawn)) {
		return spawnHandleCrash(spawn);
	}

//	if (spawn.room.energyCapacityAvailable >= STAGE_6_ENERGY_CAPACITY) {
//		return spawnStage6(spawn);
//	}

//	if (spawn.room.energyCapacityAvailable >= STAGE_5_ENERGY_CAPACITY) {
//		return spawnStage5(spawn);
//	}

//	if (spawn.room.energyCapacityAvailable >= STAGE_4_ENERGY_CAPACITY) {
//		return spawnStage4(spawn);
//	}

	if (spawn.room.energyCapacityAvailable >= STAGE_3_ENERGY_CAPACITY) {
		return spawnStage3(spawn);
	}

	if (spawn.room.energyCapacityAvailable >= STAGE_2_ENERGY_CAPACITY) {
		return spawnStage2(spawn);
	}

	//300 energy available
	return spawnStage1(spawn);
}

module.exports = {
	handleSpawn
};

