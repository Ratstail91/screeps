const roleHarvester = require('role.harvester');
const roleUpgrader = require('role.upgrader');
const roleBuilder = require('role.builder');
const roleRepairer = require('role.repairer');
const roleScout = require('role.scout');
const roleScavenger = require('role.scavenger');
const roleSignwriter = require('role.signwriter');
const roleClaimer = require('role.claimer');
const roleStoragemanager = require('role.storemanager');

const { defendSpawn } = require('utils');

const profiler = require('screeps.profiler');

function assignRoleRoutines() {
	for (const name in Game.creeps) {
		const creep = Game.creeps[name];

		//dump energy override
		if (creep.memory.dumpEnergy) {
			roleUpgrader.run(creep);
			continue;
		}

		switch(creep.memory.role) {
			case roleHarvester.ROLE_NAME:
				roleHarvester.run(creep);
				break;

			case roleBuilder.ROLE_NAME:
				roleBuilder.run(creep);
				break;

			case roleUpgrader.ROLE_NAME:
				roleUpgrader.run(creep);
				break;

			case roleRepairer.ROLE_NAME:
				roleRepairer.run(creep);
				break;

			case roleScout.ROLE_NAME:
				roleScout.run(creep);
				break;

			case roleScavenger.ROLE_NAME:
				roleScavenger.run(creep);
				break;

			case roleSignwriter.ROLE_NAME:
				roleSignwriter.run(creep);
				break;
				
			case roleClaimer.ROLE_NAME:
				roleClaimer.run(creep);
				break;

			case roleStoragemanager.ROLE_NAME:
				roleStoragemanager.run(creep);
				break;
		}
	}
}

profiler.enable();
module.exports.loop = function () {
	profiler.wrap(() => {
		defendSpawn('Spawn1');
	
		//handle creeps
		if (Object.keys(Game.creeps).length < 4) {
			//emergency!
			roleHarvester.spawn('Spawn1', 4, 'small', 0, 0);
		} else {
			//domestic types
			if (roleHarvester.spawn('Spawn1', 5, 'small', null, null) != OK)
			if (roleBuilder.spawn('Spawn1', 15, 'small', null, null) != OK)
			if (roleUpgrader.spawn('Spawn1', 15, 'small', null, null) != OK)
			if (roleRepairer.spawn('Spawn1', 2, 'small', 0, null) != OK)

			//combat types
			if (roleScout.spawn('Spawn1', 2, 'small') != OK)
			if (roleScavenger.spawn('Spawn1', 2, 'small') != OK)

			//utility types
			if (roleSignwriter.spawn('Spawn1', 1) != OK)
//			if (roleClaimer.spawn('Spawn1', 2) != OK)
//			if (roleStoragemanager.spawn('Spawn1', 2) != OK)
				; //this is odd
		}
	
		assignRoleRoutines();
	
		//delete memory of dead creeps
		for(const name in Memory.creeps) {
			if(!Game.creeps[name]) {
				delete Memory.creeps[name];
			}
		}
	});
}