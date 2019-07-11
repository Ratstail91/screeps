const { HARVEST, UPGRADE, PICKUP, DEPOSIT, WITHDRAW, BUILD, REPAIR, PATROL, TARGET } = require('behaviour_names');
const { TOWER, SPAWN, EXTENSION } = require('utils');

function createCreep(spawn, behaviours, body, tag, memory = {}) {
	//TODO: add verification, part matching between behaviours and body
	return spawn.spawnCreep(body, tag + Game.time, { memory: Object.assign({}, memory, {
		behaviours: behaviours,
		origin: spawn.name,
		tag: tag
	})});
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

	if (!population.harvester || population.harvester < 20) {
		return createCreep(spawn, [DEPOSIT, HARVEST, UPGRADE], [MOVE, MOVE, WORK, CARRY], 'harvester', {
			DEPOSIT: {
				skipIfNotFull: true
			}
		});
	}

	if (!population.builder || population.builder < 2) {
		return createCreep(spawn, [HARVEST, BUILD, REPAIR, DEPOSIT, UPGRADE], [MOVE, MOVE, WORK, CARRY], 'builder');
	}

	if (!population.upgrader || population.upgrader < 2) {
		return createCreep(spawn, [HARVEST, UPGRADE], [MOVE, MOVE, WORK, CARRY], 'upgrader');
	}

	if (!population.restocker) {
		return createCreep(spawn, [WITHDRAW, DEPOSIT], [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY], 'restocker', {
			DEPOSIT: {
				stores: [TOWER, SPAWN, EXTENSION]
			},
			WITHDRAW: {
				skipIfNotEmpty: true
			}
		});
	}

	if (!population.collector || population.collector < 2) {
		return createCreep(spawn, [PICKUP, DEPOSIT], [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY], 'collector');
	}

	if (!population.targeter) {
		return createCreep(spawn, [TARGET], [MOVE], 'targeter', {
			TARGET: {
				targetFlag: 'followme'
			}
		});
	}

	if (!population.patroller) {
		return createCreep(spawn, [PATROL], [MOVE], 'patroller', {
			PATROL: {
				targetFlags: [
					'patrol0',
					'patrol1',
					'patrol2'
				]
			}
		});
	}
}

module.exports = handleSpawn;
