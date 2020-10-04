//utilities
const { findPerchesInRoom: findPerchesInRoom, setupPerchesInRoom: setupPerchesInRoom } = require('util.perchfinder');

//spawn stuff
const spawnImperatives = require('spawn-imperatives');
const spawnAI = require('spawn-ai');
const spawnSchematics = require('spawn-schematics');

const think = room => {
	//some references to be used below
	Game.live[room.name] = {};
	Game.live[room.name].mySpawns = room.find(FIND_MY_STRUCTURES, { filter: s => s.structureType == STRUCTURE_SPAWN });
	Game.live[room.name].myCreeps = _.filter(Game.creeps, { filter: c => c.memory.homeId == room.id });
	Game.live[room.name].sources = room.find(FIND_SOURCES);
	room.memory.sourceCounter = room.memory.sourceCounter || 1;

	//find the perches TODO: remotes too
	findPerchesInRoom(room);
	setupPerchesInRoom(room);

	//determine what to build based on existing tag populations
	const upgraders = _.filter(Game.live[room.name].myCreeps, c => c.memory.tags.includes(tags.UPGRADER));
	const harvesters = _.filter(Game.live[room.name].myCreeps, c => c.memory.tags.includes(tags.HARVESTER));
	const builders = _.filter(Game.live[room.name].myCreeps, c => c.memory.tags.includes(tags.BUILDER));

	//default spawn imperative
	let spawnImperative = spawnImperatives.IDLE;

	//TODO: change the imperative based on development stage
//	if (room.energyCapacityAvailable >= 1000) {
//		//
//	} else

	//assume only 300 energy is available
	{
		//need at least 1 harvester otherwise it'll move as slow as molasses
		if (spawnImperative == spawnImperatives.IDLE && harvesters.length < 1 && room.energyAvailable >= 250) {
			spawnImperative = spawnImperatives.SPAWN_HARVESTER_SMALL;
		}

		//TODO: handle construction sites in remote rooms
		//build & repair the structures
		if (spawnImperative == spawnImperatives.IDLE && builders.length < 2 && room.energyAvailable >= 250) {
			const sites = room.find(FIND_MY_CONSTRUCTION_SITES);

			if (sites.length > 0) {
				spawnImperative = spawnImperatives.SPAWN_BUILDER_SMALL;
			}
		}

		if (spawnImperative == spawnImperatives.IDLE && upgraders.length < 2 && room.energyAvailable >= 250) {
			spawnImperative = spawnImperatives.SPAWN_UPGRADER_SMALL;
		}

		if (spawnImperative == spawnImperatives.IDLE && harvesters.length < 2 && room.energyAvailable >= 250) {
			spawnImperative = spawnImperatives.SPAWN_HARVESTER_SMALL;
		}
	}

	//find one available spawn and set it's imperative
	Game.live[room.name].mySpawns.some(s => {
		if (s.memory.imperative && s.memory.imperative == spawnImperatives.IDLE) {
			s.memory.imperative = spawnImperative;
			return true;
		}
		return false;
	});

	//pump the room's structure's AI
	Game.live[room.name].mySpawns.forEach(spawn => spawnAI.think(spawn));

	//place any construction sites that are needed
	if (Game.live[room.name].mySpawns.length > 0) {
		const center = Game.live[room.name].mySpawns[0];

		spawnSchematics.every(schema => {
			return room.createConstructionSite(center.pos.x + schema.x, center.pos.y + schema.y, schema.structureType) != ERR_RCL_NOT_ENOUGH;
		});
	}

	//continue to the next room
	return true;
};

const act = room => {
	//pump the room's structure's AI
	Game.live[room.name].mySpawns.forEach(spawn => spawnAI.act(spawn));
};

//utilities
const requestNewSourceId = room => {
	return Game.live[room.name].sources[++room.memory.sourceCounter % room.sources.length].id
};

module.exports = {
	think,
	act,
	requestNewSourceId,
};