const { HARVEST, STORE, UPGRADE } = require('behaviour_names');

function createCreep(spawn, behaviours, body, tag) {
	//TODO: add verification, part matching between behaviours and body
	return spawn.createCreep(body, tag + Game.time, { memory: {
		behaviours: behaviours,
		tag: tag
	}});
}

function getPopulationByTags() {
	//known tags
	const population = { harvester: 0, upgrader: 0 };

	//count all arbitrary tags (store them in tags, defined above)
	Object.keys(Game.creeps)
		.filter(key => Game.creeps[key].memory.tag)
		.forEach(tag => population[tag] = population[tag] + 1 || 1)
	;

	return population;
}

function handleSpawn(spawn) {
	population = getPopulationByTags();

	if (population.harvester < 10) {
		return createCreep(spawn, [HARVEST, STORE, UPGRADE], [MOVE, MOVE, WORK, CARRY], 'harvester');
	}
	if (population.upgrader < 5) {
		return createCreep(spawn, [HARVEST, UPGRADE], [MOVE, MOVE, WORK, CARRY], 'upgrader');
	}
}

module.exports = handleSpawn;
