const { getCreepsByOrigin, getPopulationByTags } = require('utils.spawns');
const { kickstart, stage1, stage2, stage3, stage4, stage5, stage6, stage7, stage8 } = require('spawns.stages');

const { autoBuild } = require('autobuilder');
const market = require('market');

//defensive towers near spawn
function defendSpawn(spawn) {
	const hostiles = spawn.room.find(FIND_HOSTILE_CREEPS)
		.filter(c => c.pos.x > 0 && c.pos.x < 49 && c.pos.y > 0 && c.pos.y < 49)
	;

	if (hostiles.length == 0) {
		return;
	}

	const username = hostiles[0].owner.username;
	Game.notify(`User ${username} spotted near ${spawn.name}`);

	const towers = spawn.room.find(FIND_MY_STRUCTURES, { filter: (structure) => structure.structureType == STRUCTURE_TOWER });
	towers.forEach(tower => tower.attack(hostiles[0]));
}

function handleSpawn(spawn) {
//console.log(spawn.name, JSON.stringify(getPopulationByTags(getCreepsByOrigin(spawn))));

	//remove 'claimme' flag (this room has been claimed)
	spawn.room.find(FIND_FLAGS, { filter: f => f.name == 'claimme'}).forEach(f => f.remove());

	//build spawn
	autoBuild(spawn, 'basic');

	//defend the spawn!
	defendSpawn(spawn);

	//sell stuff
	const terminals = spawn.room.find(FIND_MY_STRUCTURES, { filter: s => s.structureType == STRUCTURE_TERMINAL });
	if (terminals.length !== 0) {
		market(terminals[0]);
	}

	//skip this spawn if it's spawning
	if (spawn.spawning) {
		return;
	}

	//get the creep count
	const creeps = getCreepsByOrigin(spawn);
	const population = getPopulationByTags(creeps);

	//emergency
	if (creeps.length < 10 || (spawn.room.storage && (!population.restocker || population.restocker < 2) )) {
		return kickstart(spawn);
	}

	//TODO: stages 7 & 8 are not yet implemented

	if (spawn.room.energyCapacityAvailable >= 2300) {
		return stage6(spawn, creeps, population);
	}

	if (spawn.room.energyCapacityAvailable >= 1800) {
		return stage5(spawn, creeps, population);
	}

	if (spawn.room.energyCapacityAvailable >= 1300) {
		return stage4(spawn, creeps, population);
	}

	if (spawn.room.energyCapacityAvailable >= 800) {
		return stage3(spawn, creeps, population);
	}

	if (spawn.room.energyCapacityAvailable >= 550) {
		return stage2(spawn, creeps, population);
	}

	//300 energy available
	return stage1(spawn, creeps, population);
}

module.exports = handleSpawn;
