const { HARVEST, UPGRADE, DEPOSIT, WITHDRAW, BUILD, REPAIR } = require('behaviour_names');

function createCreep(spawn, behaviours, body, tag) {
	//TODO: add verification, part matching between behaviours and body
	return spawn.spawnCreep(body, tag + Game.time, { memory: {
		behaviours: behaviours,
		origin: spawn.name,
		tag: tag
	}});
}

function getPopulationByTags(spawn) {
	//known tags
	const population = {};

	//count all arbitrary tags (store them in tags, defined above)
	Object.keys(Game.creeps)
		.filter(creep => !spawn || creep.memory.origin == spawn.name)
		.map(key => Game.creeps[key].memory.tag)
		.forEach(tag => population[tag] = population[tag] + 1 || 1)
	;

	return population;
}

function handleSpawn(spawn) {
	population = getPopulationByTags();

	if (!population.harvester || population.harvester < 30) {
		return createCreep(spawn, [HARVEST, DEPOSIT, UPGRADE], [MOVE, MOVE, WORK, CARRY], 'harvester');
	}

	if (!population.builder || population.builder < 10) {
		return createCreep(spawn, [HARVEST, BUILD, REPAIR, DEPOSIT, UPGRADE], [MOVE, MOVE, WORK, CARRY], 'builder');
	}

	if (!population.upgrader || population.upgrader < 10) {
		return createCreep(spawn, [HARVEST, UPGRADE], [MOVE, MOVE, WORK, CARRY], 'upgrader');
	}

	if (!population.restock || population.restock < 2) {
		return createCreep(spawn, [WITHDRAW, DEPOSIT], [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY], 'restock');
	}
}

module.exports = handleSpawn;
