const { domesticSpawn, roleLength } = require('utils');
const roleHarvester = require('role.harvester');

const ROLE_NAME = 'repairer';

function run(creep) {
	//working?
	if (creep.memory.working && creep.carry.energy == 0) {
		creep.memory.working = false;
	} else if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
		creep.memory.working = true;
	}

	//repair a structure
	if (creep.memory.working) {
		const repTargets = creep.room.find(FIND_STRUCTURES, {
			filter: (target) => target.hits < target.hitsMax
		});

		if (repTargets.length > 0) {
			if(creep.repair(repTargets[0]) == ERR_NOT_IN_RANGE) {
				creep.moveTo(repTargets[0], {reusePath: 10});
			}
		} else {
			roleHarvester.run(creep);
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