const { MAX_REMOTES, domesticSpawn, roleLength } = require('utils');
const roleHarvester = require('role.harvester');

const ROLE_NAME = 'repairer';

function run(creep) {
	//working?
	if (creep.memory.working && creep.carry.energy == 0) {
		creep.memory.working = false;
	} else if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
		creep.memory.working = true;
	}

	//initialize the repairer's internals
	if (creep.memory.repairRemote == undefined) {
		creep.memory.repairRemote = 0;
	}

	//repair a structure
	if (creep.memory.working) {
		//if not in the target room
		if (creep.room.find(FIND_FLAGS, {filter: flag => flag.name == `remote${creep.memory.repairRemote}`}).length == 0) {
			creep.moveTo(Game.flags[`remote${creep.memory.repairRemote}`], {reusePath: 10});
			return;
		}

		const repTargets = creep.room.find(FIND_STRUCTURES, {
			filter: (target) => target.hits < target.hitsMax && target.structureType != STRUCTURE_WALL
		});

		if (repTargets.length > 0) {
			if(creep.repair(repTargets[0]) == ERR_NOT_IN_RANGE) {
				creep.moveTo(repTargets[0], {reusePath: 10});
			}
		} else {
			//if no targets to repair while working
			creep.memory.repairRemote++;
			if (creep.memory.repairRemote >= MAX_REMOTES) {
				creep.memory.repairRemote = 0;
			}

			//harvest in this room
			creep.memory.remote = creep.memory.repairRemote;
			creep.memory.source = null;
		}
	} else {
		roleHarvester.run(creep);
	}
}

module.exports = {
	ROLE_NAME: ROLE_NAME,
	spawn: (origin, max, type, remote, source) => domesticSpawn(origin, max, ROLE_NAME, type, remote, source),
	run: run
};