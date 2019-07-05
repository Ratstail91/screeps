const { MAX_REMOTES, domesticSpawn, getStorage } = require('utils');

const ROLE_NAME = 'harvester';

function run(creep) {
	//working?
	if (creep.memory.working && creep.carry.energy == 0) {
		creep.memory.working = false;
	} else if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
		creep.memory.working = true;
	}

	//NOTE: backwards in the harvester because goofy AF
	if(!creep.memory.working) {
		//move to a specified remote
		if (creep.memory.remote == null) {
			creep.memory.remote = Math.floor(Math.random() * MAX_REMOTES);
		}

		const remoteFlag = creep.room.find(FIND_FLAGS, {filter: (flag) => flag.name == `remote${creep.memory.remote}` });
		if (remoteFlag.length == 0) {
			creep.moveTo(Game.flags[`remote${creep.memory.remote}`], {reusePath: 10, visualizePathStyle: {stroke: '#ff00ff' }});
			return;
		}

		//dig for energy
		const sources = creep.room.find(FIND_SOURCES);

		//target a random source to free up real estate
		if (creep.memory.source == null || creep.memory.source >= sources.length) {
			creep.memory.source = Math.floor(Math.random() * sources.length);
		}

		const harvestResults = creep.harvest(sources[creep.memory.source]);

		if(harvestResults == ERR_NOT_IN_RANGE) {
			const moveResult = creep.moveTo(sources[creep.memory.source], {reusePath: 10, visualizePathStyle: {stroke: '#ff00ff' }});
			//no path to this source
			if (moveResult == ERR_NO_PATH) {
				creep.memory.remote = null;
				creep.memory.source = null;
			}
		}

		if (harvestResults == ERR_NOT_ENOUGH_RESOURCES) {
			//go to a random source
			creep.memory.remote = null;
			creep.memory.source = null;
		}
	}
	else {
		//if not at home, go home
		const homeFlag = creep.room.find(FIND_FLAGS, {filter: (flag) => flag.name == 'home' });
		if (homeFlag.length == 0) {
			creep.moveTo(Game.flags['home'], {reusePath: 10, visualizePathStyle: {stroke: '#ff00ff' }});
			return;
		}

		//get the storages
		const storage = getStorage(creep);

		const transferResult = creep.transfer(storage[0], RESOURCE_ENERGY);

		if(transferResult == ERR_NOT_IN_RANGE) {
			creep.moveTo(storage[0], {reusePath: 10, visualizePathStyle: {stroke: '#ff00ff' }});
		} else if ((transferResult == ERR_FULL || storage.length == 0) && creep.room.controller.my) {
			creep.memory.dumpEnergy = true;
		}
	}
}

module.exports = {
	ROLE_NAME: ROLE_NAME,
	spawn: (origin, max, type, remote, source) => domesticSpawn(origin, max, ROLE_NAME, type, remote, source),
	run: run
};