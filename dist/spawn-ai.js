const imperatives = require('spawn-imperatives');
const tags = require('constants.tags');
const instructions = require('constants.instructions');

const think = spawn => {
	//init memory
	spawn.memory.imperative = spawn.memory.imperative || imperatives.IDLE;

	return true;
};

const act = spawn => {
	const smallBody = [WORK, CARRY, MOVE, MOVE]; //250 energy

	switch(spawn.memory.imperative) {
		case imperatives.IDLE:
			//DO NOTHING
			return true;

		case imperatives.SPAWN_HARVESTER_SMALL:
			spawn.spawnCreep(smallBody, 'harvester' + Game.time, {
				memory: {
					homeId: spawn.room.id, //know where your home is
					tags: [tags.HARVESTER],
					instructions: [
						instructions.HARVEST,
						instructions.STASH,
						instructions.UPGRADE,
					],
					harvest: {
						targetId: Game.live[spawn.room.name].sources[++spawn.room.memory.sourceCounter % Game.live[spawn.room.name].sources.length].id
					}
				}
			});

			spawn.memory.imperative = imperatives.IDLE;
			return false;

		case imperatives.SPAWN_BUILDER_SMALL:
			spawn.spawnCreep(smallBody, 'builder' + Game.time, {
				memory: {
					homeId: spawn.room.id, //know where your home is
					tags: [tags.BUILDER],
					instructions: [
						instructions.HARVEST,
						instructions.REPAIR,
						instructions.BUILD,
						instructions.STASH,
						instructions.UPGRADE,
					],
					harvest: {
						targetId: Game.live[spawn.room.name].sources[++spawn.room.memory.sourceCounter % Game.live[spawn.room.name].sources.length].id
					}
				}
			});

			spawn.memory.imperative = imperatives.IDLE;
			return false;

		case imperatives.SPAWN_UPGRADER_SMALL:
			spawn.spawnCreep(smallBody, 'upgrader' + Game.time, {
				memory: {
					homeId: spawn.room.id, //know where your home is
					tags: [tags.UPGRADER],
					instructions: [
						instructions.HARVEST,
						instructions.UPGRADE,
					],
					harvest: {
						targetId: Game.live[spawn.room.name].sources[++spawn.room.memory.sourceCounter % Game.live[spawn.room.name].sources.length].id
					}
				}
			});

			spawn.memory.imperative = imperatives.IDLE;
			return false;

		default:
			throw new Error('Unknown imperative: ' + spawn.memory.imperative);
	}
};

module.exports = {
	think,
	act,
};
