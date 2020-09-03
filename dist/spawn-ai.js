const imperatives = require('spawn-imperatives');

const think = spawn => {
	const myCreeps = _.filter(Game.creeps, c => c.memory.spawnId == spawn.id);
	
	//enough upgraders?
	const upgraderLength = _.filter(myCreeps, c => c.memory.tags.includes('UPGRADER')).length;

	if (upgraderLength < 2 && spawn.room.energyAvailable >= 250) {
		//determine which source to target
		const sources = spawn.room.find(FIND_SOURCES);
		spawn.memory.sourceIncrement = spawn.memory.sourceIncrement || 1;
		spawn.memory.harvesterTargetId = sources[spawn.memory.sourceIncrement % sources.length].id;
		spawn.memory.sourceIncrement++;

		return spawn.memory.imperative = imperatives.SPAWN_UPGRADER_SMALL;
	}
	
	//enough harvesters?
	const harvesterLength = _.filter(myCreeps, c => c.memory.tags.includes('HARVESTER')).length;
	
	if (harvesterLength < 2 && spawn.room.energyAvailable >= 250) {
		//determine which source to target
		const sources = spawn.room.find(FIND_SOURCES);
		spawn.memory.sourceIncrement = spawn.memory.sourceIncrement || 1;
		spawn.memory.harvesterTargetId = sources[spawn.memory.sourceIncrement % sources.length].id;
		spawn.memory.sourceIncrement++;

		return spawn.memory.imperative = imperatives.SPAWN_HARVESTER_SMALL;
	}
	
	//enough builders for the construction sites?
	if (spawn.room.find(FIND_MY_CONSTRUCTION_SITES).length > 0) {
		const builderLength = _.filter(myCreeps, c => c.memory.tags.includes('BUILDER')).length;
		
		if (builderLength < 2 && spawn.room.energyAvailable >= 250) {
			//determine which source to target
			const sources = spawn.room.find(FIND_SOURCES);
			spawn.memory.sourceIncrement = spawn.memory.sourceIncrement || 1;
			spawn.memory.harvesterTargetId = sources[spawn.memory.sourceIncrement % sources.length].id;
			spawn.memory.sourceIncrement++;

			return spawn.memory.imperative = imperatives.SPAWN_BUILDER_SMALL;
		}
	}
	
	//default: idle
	return spawn.memory.imperative = imperatives.IDLE;
};

const act = spawn => {
	switch(spawn.memory.imperative) {
		case imperatives.IDLE:
			//DO NOTHING
			break;
		
		case imperatives.SPAWN_HARVESTER_SMALL:
			spawn.spawnCreep([WORK, CARRY, CARRY, MOVE], 'harvester' + Game.time, {
				memory: {
					spawnId: spawn.id, //know where your home is
					tags: ['HARVESTER'],
					instructions: [
						'HARVEST',
						'STASH',
					],
					harvest: {
						targetId: spawn.memory.harvesterTargetId,
					}
				}
			});
			break;
		
		case imperatives.SPAWN_BUILDER_SMALL:
			spawn.spawnCreep([WORK, CARRY, CARRY, MOVE], 'builder' + Game.time, {
				memory: {
					spawnId: spawn.id, //know where your home is
					tags: ['BUILDER'],
					instructions: [
						'HARVEST',
						'REPAIR',
						'BUILD',
						'STASH'
					],
					harvest: {
						targetId: spawn.memory.harvesterTargetId,
					}
				}
			});
			break;
		
		case imperatives.SPAWN_UPGRADER_SMALL:
			spawn.spawnCreep([WORK, CARRY, CARRY, MOVE], 'upgrader' + Game.time, {
				memory: {
					spawnId: spawn.id, //know where your home is
					tags: ['UPGRADER'],
					instructions: [
						'HARVEST',
						'UPGRADE'
					],
					harvest: {
						targetId: spawn.memory.harvesterTargetId,
					}
				}
			});
			break;
		
		default:
			//TODO: throw an error
	}
}

module.exports = {
	think,
	act,
};
