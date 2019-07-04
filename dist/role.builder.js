const { domesticSpawn } = require('utils');
const roleHarvester = require('role.harvester');

const ROLE_NAME = 'builder';

function run(creep) {
	//working?
	if (creep.memory.working && creep.carry.energy == 0) {
		creep.memory.working = false;
	} else if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
		creep.memory.working = true;
	}

	//build a structure
	if (creep.memory.working) {
		const constructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);

		if (!constructionSite) {
			roleHarvester.run(creep);
		} else {
			 if (creep.build(constructionSite) == ERR_NOT_IN_RANGE) {
				creep.moveTo(constructionSite, {reusePath: 10});
			}
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