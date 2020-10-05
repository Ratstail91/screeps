//utilities
const { findPerchesInRoom: findPerchesInRoom, setupPerchesInRoom: setupPerchesInRoom } = require('util.perchfinder');

const energyAvailable = require('constants.energy-available');

//TODO: determine how many structures need repairing

//spawn stuff
const spawnImperatives = require('constants.spawn-imperatives');
const spawnAI = require('spawn-ai');
const spawnSchematics = require('spawn-schematics');
const tags = require('constants.tags');

const think = room => {
	//some references to be used below
	Game.live[room.name] = {};
	Game.live[room.name].mySpawns = room.find(FIND_MY_STRUCTURES, { filter: s => s.structureType == STRUCTURE_SPAWN });
	Game.live[room.name].myCreeps = _.filter(Game.creeps, c => c.memory.homeName == room.name);
	Game.live[room.name].sources = room.find(FIND_SOURCES);
	room.memory.sourceCounter = room.memory.sourceCounter || 1;

	let spawnImperative = spawnImperatives.IDLE;

	//change the imperative based on development stage
	if (room.controller.level <= 1) {
		//assume only 300 energy is available
		spawnImperative = thinkStages.begin(room); //handle initial setup
	} else

	if (energyAvailable[room.controller.level] <= room.energyCapacityAvailable) {
		spawnImperative = thinkStages.upgrade(room);
	} else

	{
		spawnImperative = thinkStages.build(room);
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

	//find the perches TODO: remotes too
	findPerchesInRoom(room);
	setupPerchesInRoom(room);

	//continue to the next room
	return true;
};

const act = room => {
	//pump the room's structure's AI
	Game.live[room.name].mySpawns.forEach(spawn => spawnAI.act(spawn));
};

//TODO: more sophisticated later stages
//stages
const thinkStages = {
	begin: room => {
		//determine what to build based on existing tag populations
		const upgraders = _.filter(Game.live[room.name].myCreeps, c => c.memory.tags.includes(tags.UPGRADER));
		const harvesters = _.filter(Game.live[room.name].myCreeps, c => c.memory.tags.includes(tags.HARVESTER));
		const builders = _.filter(Game.live[room.name].myCreeps, c => c.memory.tags.includes(tags.BUILDER));

		//default spawn imperative
		let spawnImperative = spawnImperatives.IDLE;

		//need at least 1 harvester otherwise it'll move as slow as molasses
		if (spawnImperative == spawnImperatives.IDLE && harvesters.length < 1 && room.energyAvailable >= 250) {
			spawnImperative = spawnImperatives.SPAWN_HARVESTER_SMALL;
		}

		if (spawnImperative == spawnImperatives.IDLE && upgraders.length < 2 && room.energyAvailable >= 250) {
			spawnImperative = spawnImperatives.SPAWN_UPGRADER_SMALL;
		}

		if (spawnImperative == spawnImperatives.IDLE && harvesters.length < 2 && room.energyAvailable >= 250) {
			spawnImperative = spawnImperatives.SPAWN_HARVESTER_SMALL;
		}

		return spawnImperative;
	},

	build: room => {
		//determine what to build based on existing tag populations
		const upgraders = _.filter(Game.live[room.name].myCreeps, c => c.memory.tags.includes(tags.UPGRADER));
		const harvesters = _.filter(Game.live[room.name].myCreeps, c => c.memory.tags.includes(tags.HARVESTER));
		const builders = _.filter(Game.live[room.name].myCreeps, c => c.memory.tags.includes(tags.BUILDER));

		//default spawn imperative
		let spawnImperative = spawnImperatives.IDLE;

		//need at least 1 harvester otherwise it'll move as slow as molasses
		if (spawnImperative == spawnImperatives.IDLE && harvesters.length < 1 && room.energyAvailable >= 250) {
			spawnImperative = spawnImperatives.SPAWN_HARVESTER_SMALL;
		}

		//TODO: handle construction sites in remote rooms
		//build & repair the structures
		if (spawnImperative == spawnImperatives.IDLE && builders.length < 6 && room.energyAvailable >= 200 + 100 + 50) { //[CARRY, CARRY, CARRY, CARRY, WORK, MOVE]
			const sites = room.find(FIND_MY_CONSTRUCTION_SITES);

			if (sites.length > 0) {
				spawnImperative = spawnImperatives.SPAWN_BUILDER;
			}
		}

		//need at least 1 builder or you might get soft-locked
		if (spawnImperative == spawnImperatives.IDLE && builders.length < 6 && room.energyAvailable >= 250) {
			const sites = room.find(FIND_MY_CONSTRUCTION_SITES);

			if (sites.length > 0) {
				spawnImperative = spawnImperatives.SPAWN_BUILDER_SMALL;
			}
		}

		//miners
		//TODO: one miner for each source in the remotes
		if (spawnImperative == spawnImperatives.IDLE && harvesters.length < 2 && room.energyAvailable >= 500 + 50) { //[WORK, WORK, WORK, WORK, WORK, MOVE]
			spawnImperative = spawnImperatives.SPAWN_HARVESTER_STATIC;
		}

		return spawnImperative;
	},

	upgrade: room => {
		//determine what to build based on existing tag populations
		const upgraders = _.filter(Game.live[room.name].myCreeps, c => c.memory.tags.includes(tags.UPGRADER));
		const harvesters = _.filter(Game.live[room.name].myCreeps, c => c.memory.tags.includes(tags.HARVESTER));
		const builders = _.filter(Game.live[room.name].myCreeps, c => c.memory.tags.includes(tags.BUILDER));
		const lorries = _.filter(Game.live[room.name].myCreeps, c => c.memory.tags.includes(tags.LORRY));

		//default spawn imperative
		let spawnImperative = spawnImperatives.IDLE;

		//need at least 1 harvester otherwise it'll move as slow as molasses
		if (spawnImperative == spawnImperatives.IDLE && harvesters.length < 1 && room.energyAvailable >= 250) {
			spawnImperative = spawnImperatives.SPAWN_HARVESTER_SMALL;
		}

		//miners
		if (spawnImperative == spawnImperatives.IDLE && harvesters.length < 2 && room.energyAvailable >= 500 + 50) { //[WORK, WORK, WORK, WORK, WORK, MOVE]
			spawnImperative = spawnImperatives.SPAWN_HARVESTER_STATIC;
		}

		//upgrade the controller
		if (spawnImperative == spawnImperatives.IDLE && lorries.length < 4 && room.energyAvailable >= 300) { //[CARRY, CARRY, CARRY, CARRY, CARRY, MOVE]
			spawnImperative = spawnImperatives.SPAWN_LORRY;
		}

		//upgrade the controller
		if (spawnImperative == spawnImperatives.IDLE && upgraders.length < 16 && room.energyAvailable >= 200 + 100 + 50) { //[CARRY, CARRY, CARRY, CARRY, WORK, MOVE]
			spawnImperative = spawnImperatives.SPAWN_UPGRADER;
		}

		return spawnImperative;
	},
};

module.exports = {
	think,
	act,
};