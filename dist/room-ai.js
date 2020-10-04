//spawn stuff
const spawnImperatives = require('spawn-imperatives');
const spawnAI = require('spawn-ai');
const spawnSchematics = require('spawn-schematics');

const think = room => {
	//some references to be used below
	room.mySpawns = room.find(FIND_MY_STRUCTURES, { filter: s => s.structureType == STRUCTURE_SPAWN });
	room.myCreeps = _.filter(Game.creeps, { filter: c => c.memory.homeId == room.id });
	room.sources = room.find(FIND_SOURCES);

	//determine what to build based on existing tag populations
	const upgraders = _.filter(room.myCreeps, c => c.memory.tags.includes(tags.UPGRADER));
	const harvesters = _.filter(room.myCreeps, c => c.memory.tags.includes(tags.HARVESTER));
	const builders = _.filter(room.myCreeps, c => c.memory.tags.includes(tags.BUILDER));

	//default spawn imperative
	let spawnImerative = spawnImperatives.IDLE;

	//TODO: change the imperative based on development stage
//	if (room.energyCapacityAvailable >= 1000) {
//		//
//	} else

	//assume only 300 energy is available

	{
		//TODO: handle construction sites in remote rooms
		if (builders.length < 2 && room.energyAvailable >= 250) {
			const sites = room.find(FIND_MY_CONSTRUCTION_SITES);

			if (sites.length > 0) {
				spawnImerative = spawnImperatives.SPAWN_BUILDER_SMALL;
			}
		} else

		if (upgraders.length < 2 && room.energyAvailable >= 250) {
			spawnImerative = spawnImperatives.SPAWN_UPGRADER_SMALL;
		} else

		if (harvesters.length < 2 && room.energyAvailable >= 250) {
			spawnImerative = spawnImperatives.SPAWN_HARVESTER_SMALL;
		}
	}

	//find one available spawn and set it's imperative
	room.mySpawns.some(s => {
		if (s.memory.imperative && s.memory.imperative == spawnImperatives.IDLE) {
			s.memory.imperative = spawnImerative;
			return true;
		}
		return false;
	});

	//pump the room's structure's AI
	room.mySpawns.forEach(spawn => spawnAI.think(spawn));

	//place any construction sites that are needed
	if (room.mySpawns.length > 0) {
		const center = room.mySpawns[0];

		spawnSchematics.every(schema => {
			return room.createConstructionSite(center.pos.x + schema.x, center.pos.y + schema.y, schema.structureType) != ERR_RCL_NOT_ENOUGH;
		});
	}

	//continue to the next room
	return true;
};

const act = room => {
	//pump the room's structure's AI
	room.mySpawns.forEach(spawn => spawnAI.act(spawn));
};

module.exports = {
	think,
	act,
};