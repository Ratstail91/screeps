const { domesticSpawn } = require('utils');
const roleHarvester = require('role.harvester');

const ROLE_NAME = 'upgrader';

function run(creep) {
	//working?
	if (creep.memory.working && creep.carry.energy == 0) {
		creep.memory.working = false;
		creep.memory.dumpEnergy = false;
	} else if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
		creep.memory.working = true;
	}

	//transfer energy to the controller
	if (creep.memory.working) {
		if (!creep.room.controller.my) {
			roleHarvester.run(creep);
		}

		if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
			creep.moveTo(creep.room.controller, {reusePath: 10});
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