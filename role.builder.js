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
		const constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES, { filter: site => site.structureType != STRUCTURE_RAMPART });
		const rampartConstructionSites = creep.room.find(FIND_CONSTRUCTION_SITES, { filter: site => site.structureType == STRUCTURE_RAMPART });

		//NOTE: build ramparts last
		const allSites = [...constructionSites, ...rampartConstructionSites];

		if (allSites.length == 0) {
			//mimic the repairers a little bit
			const repTarget = creep.pos.findClosestByPath(FIND_STRUCTURES, {
				filter: (target) => target.hits < target.hitsMax && target.structureType == STRUCTURE_RAMPART
			});

			if (repTarget) {
				if(creep.repair(repTarget) == ERR_NOT_IN_RANGE) {
					creep.moveTo(repTarget, {reusePath: 10});
				}
			} else {
				roleHarvester.run(creep);
			}
		} else {
			 if (creep.build(allSites[0]) == ERR_NOT_IN_RANGE) {
				creep.moveTo(allSites[0], {reusePath: 10});
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