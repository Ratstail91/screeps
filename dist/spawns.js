const {
	STAGE_1_ENERGY_CAPACITY,
	STAGE_2_ENERGY_CAPACITY,
	STAGE_3_ENERGY_CAPACITY,
	STAGE_4_ENERGY_CAPACITY,
	STAGE_5_ENERGY_CAPACITY,
	STAGE_6_ENERGY_CAPACITY,
//	STAGE_7_ENERGY_CAPACITY,
//	STAGE_8_ENERGY_CAPACITY,
} = require("constants");

const spawnStage1 = require("spawns.stage1");
const spawnStage2 = require("spawns.stage2");
const spawnStage3 = require("spawns.stage3");
const spawnStage4 = require("spawns.stage4");
const spawnStage5 = require("spawns.stage5");
const spawnStage6 = require("spawns.stage6");

const { handleMarket } = require("market");

const { spawnHasCrashed, spawnHandleCrash } = require("spawns.crash");
const { initializeSpawnMemory, countRemotes } = require("spawns.utils");

const allies = require("allies");

/* DOCS: handleSpawn(spawn)
 * Handles the AI for "spawn"
*/
function handleSpawn(spawn) {
	if (!Memory.spawns || !Memory.spawns[spawn.name]) {
		initializeSpawnMemory(spawn);
	}

	defendSpawn(spawn);

	//skip this spawn if it's spawning
	if (spawn.spawning) {
		handleMarket(spawn);

		//TODO:handleLabs
		const labs = require('store.utils').getStores(spawn, ['LAB']);

		if (labs.length >= 3) {
			labs[0].runReaction(labs[1], labs[2]);
		}
	
		return;
	}

	//handle crashes, etc.
	if (spawnHasCrashed(spawn)) {
		return spawnHandleCrash(spawn);
	}

	handleMarket(spawn);

	//TODO:handleLabs
	const labs = require('store.utils').getStores(spawn, ['LAB']);

	if (labs.length >= 3) {
		labs[0].runReaction(labs[1], labs[2]);
	}

	//TODO: stage 7 & 8

	if (spawn.room.energyCapacityAvailable >= STAGE_6_ENERGY_CAPACITY) {
		return spawnStage6(spawn);
	}

	if (spawn.room.energyCapacityAvailable >= STAGE_5_ENERGY_CAPACITY) {
		return spawnStage5(spawn);
	}

	if (spawn.room.energyCapacityAvailable >= STAGE_4_ENERGY_CAPACITY) {
		return spawnStage4(spawn);
	}

	if (spawn.room.energyCapacityAvailable >= STAGE_3_ENERGY_CAPACITY) {
		return spawnStage3(spawn);
	}

	if (spawn.room.energyCapacityAvailable >= STAGE_2_ENERGY_CAPACITY) {
		return spawnStage2(spawn);
	}

	//300 energy available
	return spawnStage1(spawn);
}

//defensive towers near spawn
function defendSpawn(spawn) {
	const hostiles = spawn.room.find(FIND_HOSTILE_CREEPS)
		.filter(c => c.pos.x > 0 && c.pos.x < 49 && c.pos.y > 0 && c.pos.y < 49)
		.filter(c => allies.indexOf(c.owner.username) == -1) //NOTE: untested
	;

	if (hostiles.length == 0) {
		return;
	}

	const username = hostiles[0].owner.username;
	if (username != "Invader") {
		Game.notify(`User ${username} spotted near ${spawn.name}`);
	}

	const towers = spawn.room.find(FIND_MY_STRUCTURES, { filter: s => s.structureType == STRUCTURE_TOWER });
	towers.forEach(t => t.attack(hostiles[0]));
}

const profiler = require('screepers.profiler');

module.exports = {
	handleSpawn: profiler.registerFN(handleSpawn, "spawns.handleSpawn"),
};
