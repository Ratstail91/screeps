const imperatives = require('constants.spawn-imperatives');
const tags = require('constants.tags');
const instructions = require('constants.instructions');

const { requestNewSourceId: requestNewSourceId } = require('util.room-ai');

const think = spawn => {
	//init memory
	spawn.memory.imperative = spawn.memory.imperative || imperatives.IDLE;

	//pop a safe mode in an emergency
	if (spawn.hits < spawn.hitsMax) {
		const safeMode = spawn.room.controller.activateSafeMode();

		console.log('Safe mode triggered: ' + safeMode);
		Game.notify('Safe mode triggered: ' + safeMode);
	}

	return true;
};

const act = spawn => {
	const smallBody = [WORK, CARRY, MOVE, MOVE]; //250 energy
	const loadBody = [CARRY, CARRY, CARRY, CARRY, WORK, MOVE]; //350 energy
	const workBody = [WORK, WORK, WORK, WORK, WORK, MOVE]; //55 energy
	const lorryBody = [CARRY, CARRY, CARRY, CARRY, CARRY, MOVE]; //300 energy

	switch(spawn.memory.imperative) {
		case imperatives.IDLE:
			//DO NOTHING
			return true;

		case imperatives.SPAWN_HARVESTER_SMALL:
			spawn.spawnCreep(smallBody, 'harvester' + Game.time, {
				memory: {
					homeName: spawn.room.name, //know where your home is
					tags: [tags.HARVESTER],
					instructions: [
						instructions.HARVEST,
						instructions.STASH,
						instructions.UPGRADE,
					],
					harvest: {
						targetId: requestNewSourceId(spawn.room)
					}
				}
			});

			spawn.memory.imperative = imperatives.IDLE;
			return false;

		case imperatives.SPAWN_HARVESTER_STATIC: {
			//use this elsewhere
			const newSourceId = requestNewSourceId(spawn.room);

			//determine perch
			const perch = _.filter(spawn.room.memory.perches.sources, perch => perch.id == newSourceId)[0];

			spawn.spawnCreep(workBody, 'harvester' + Game.time, {
				memory: {
					homeName: spawn.room.name, //know where your home is
					tags: [tags.HARVESTER, tags.HARVESTER_STATIC],
					instructions: [
						instructions.SIT,
						instructions.HARVEST,
					],
					sit: {
						x: perch.x,
						y: perch.y,
						roomName: spawn.room.name
					},
					harvest: {
						targetId: newSourceId
					}
				}
			});

			spawn.memory.imperative = imperatives.IDLE;
			return false;
		}

		case imperatives.SPAWN_BUILDER_SMALL:
			spawn.spawnCreep(smallBody, 'builder' + Game.time, {
				memory: {
					homeName: spawn.room.name, //know where your home is
					tags: [tags.BUILDER],
					instructions: [
						instructions.HARVEST,
						instructions.REPAIR,
						instructions.BUILD,
						instructions.STASH,
						instructions.UPGRADE,
					],
					harvest: {
						targetId: requestNewSourceId(spawn.room)
					}
				}
			});

			spawn.memory.imperative = imperatives.IDLE;
			return false;

		case imperatives.SPAWN_BUILDER:
			spawn.spawnCreep(loadBody, 'builder' + Game.time, {
				memory: {
					homeName: spawn.room.name, //know where your home is
					tags: [tags.BUILDER],
					instructions: [
						instructions.GRAB,
						instructions.HARVEST,
						instructions.REPAIR,
						instructions.BUILD,
						instructions.STASH,
						instructions.UPGRADE,
					],
					harvest: {
						targetId: requestNewSourceId(spawn.room)
					}
				}
			});

			spawn.memory.imperative = imperatives.IDLE;
			return false;

		case imperatives.SPAWN_UPGRADER_SMALL:
			spawn.spawnCreep(smallBody, 'upgrader' + Game.time, {
				memory: {
					homeName: spawn.room.name, //know where your home is
					tags: [tags.UPGRADER],
					instructions: [
						instructions.HARVEST,
						instructions.UPGRADE,
					],
					harvest: {
						targetId: requestNewSourceId(spawn.room)
					}
				}
			});

			spawn.memory.imperative = imperatives.IDLE;
			return false;

		case imperatives.SPAWN_UPGRADER:
			spawn.spawnCreep(loadBody, 'upgrader' + Game.time, {
				memory: {
					homeName: spawn.room.name, //know where your home is
					tags: [tags.UPGRADER],
					instructions: [
						instructions.GRAB,
						instructions.HARVEST,
						instructions.UPGRADE,
					],
					harvest: {
						targetId: requestNewSourceId(spawn.room)
					}
				}
			});

			spawn.memory.imperative = imperatives.IDLE;
			return false;

		case imperatives.SPAWN_LORRY:
			spawn.spawnCreep(lorryBody, 'lorry' + Game.time, {
				memory: {
					homeName: spawn.room.name, //know where your home is
					tags: [tags.LORRY],
					instructions: [
						instructions.RELOADDEFENSES,
						instructions.GRAB,
						instructions.STASH,
					]
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
