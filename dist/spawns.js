const { HARVEST, UPGRADE, PICKUP, DEPOSIT, WITHDRAW, BUILD, REPAIR, PATROL, TARGET, FEAR, BRAVE, CRY, CARE } = require('behaviour_names');
const { TOWER, SPAWN, EXTENSION } = require('utils.store');

const { serialize } = require('behaviour.fear');

function spawnCreep(spawn, name, behaviours, body, tags, memory = {}) {
	//TODO: add verification, part matching between behaviours and body
	return spawn.spawnCreep(body, name + Game.time, { memory: Object.assign({}, memory, {
		behaviours: behaviours,
		origin: spawn.name,
		tags: tags
	})});
}

function getPopulationByTags(spawn) {
	//known tags
	const population = {};

	//count all arbitrary tags (store them in tags, defined above)
	Object.values(Game.creeps)
		.filter(creep => !spawn || creep.memory.origin == spawn.name)
		.map(creep => creep.memory.tags)
		.forEach(tags => {
			tags.forEach(tag => population[tag] = population[tag] + 1 || 1)
		})
	;

	return population;
}

//TODO: get population by origin - a more accurate snapshot than tags

function handleSpawn(spawn) {
	population = getPopulationByTags(spawn);

	//NOTE: basic kickstart routine

	//spawn harvesters
	if (!population.harvester || population.harvester < 10) {
		//small for now
		return spawnCreep(spawn, 'harvester', [CRY, DEPOSIT, HARVEST, UPGRADE], [MOVE, MOVE, WORK, CARRY], ['harvester'], {
			DEPOSIT: {
				skipIfNotFull: true
			}
		});
	}

	//spawn upgraders
	if (!population.upgrader || population.upgrader < 5) {
		//small for now
		return spawnCreep(spawn, 'upgrader', [CRY, HARVEST, UPGRADE], [MOVE, MOVE, WORK, CARRY], ['upgrader']);
	}

	//spawn patrolling guards that respond to cries
	if (!population.patroller || population.patroller < 2) {
		return spawnCreep(spawn, 'patroller', [CARE, BRAVE, PATROL], [TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, ATTACK], ['patroller', 'responder'], {
			PATROL: {
				targetFlags: [
					'Spawn1remote0',
					'Spawn1remote1',
					'Spawn1remote2',
					'Spawn1remote3',
				]
			}
		});
	}
}

module.exports = handleSpawn;
