const roleHarvester = require('role.harvester');
const roleUpgrader = require('role.upgrader');
const roleBuilder = require('role.builder');
const roleRepairer = require('role.repairer');
const roleScout = require('role.scout');
const roleScavenger = require('role.scavenger');
const roleSignwriter = require('role.signwriter');
const roleClaimer = require('role.claimer');
const roleStoremanager = require('role.storemanager');

const { defendSpawn } = require('utils');
const { autoBuild, placeConstructionSites } = require('screeps.autobuilder');

const profiler = require('screeps.profiler');

function assignRoleRoutines() {
	for (const name in Game.creeps) {
		const creep = Game.creeps[name];

		//if still spawning
		if (creep.spawning) {
			continue;
		}

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

			case roleStoremanager.ROLE_NAME:
				roleStoremanager.run(creep);
				break;
		}
	}
}

function handleSpawn(spawnName) {
	if (!Game.spawns[spawnName]) {
		return;
	}

	defendSpawn(spawnName);

	//build spawn
	autoBuild(Game.spawns[spawnName], 'basic');

	//build ramparts manually at level 4+
	if (Game.spawns[spawnName].room.controller.level >= 4) {
		placeConstructionSites(Game.spawns[spawnName], require('ramparts4.autobuild'));
	}

	//handle creeps
	if (Object.keys(Game.creeps).length < 4) { //start up
		//emergency!
		roleHarvester.spawn(spawnName, 4, 'small', 0, 0);
	} else if (Game.spawns[spawnName].room.energyCapacityAvailable < 500) { //tiny - no extensions
		//small domestic types only
		if (roleHarvester.spawn(spawnName, 10, 'small', null, null) != OK)
		if (roleBuilder.spawn(spawnName, 15, 'small', null, null) != OK)
		if (roleUpgrader.spawn(spawnName, 5, 'small', null, null) != OK)
		if (roleRepairer.spawn(spawnName, 2, 'small', 0, null) != OK)
			; //DO NOTHING
	} else if (Game.spawns[spawnName].room.energyCapacityAvailable < 800) { //small - 5 extensions
		//small domestic types
		if (roleHarvester.spawn(spawnName, 10, 'small', null, null) != OK)
		if (roleBuilder.spawn(spawnName, 15, 'small', null, null) != OK)
		if (roleUpgrader.spawn(spawnName, 5, 'small', null, null) != OK)
		if (roleRepairer.spawn(spawnName, 2, 'small', 0, null) != OK)

		//combat types
		if (roleScout.spawn(spawnName, 2, 'small') != OK)
		if (roleScavenger.spawn(spawnName, 1, 'small') != OK)
			; //DO NOTHING
	} else if (Game.spawns[spawnName].room.energyCapacityAvailable < 1300) { //medium - 10 extensions
		//medium domestic types
		if (roleHarvester.spawn(spawnName, 10, 'medium', null, null) != OK)
		if (roleBuilder.spawn(spawnName, 15, 'medium', null, null) != OK)
		if (roleUpgrader.spawn(spawnName, 5, 'medium', null, null) != OK)
		if (roleRepairer.spawn(spawnName, 2, 'medium', 0, null) != OK)

		//combat types
		if (roleScout.spawn(spawnName, 2, 'medium') != OK)
		if (roleScavenger.spawn(spawnName, 1, 'medium') != OK)

		//utility types
		if (roleSignwriter.spawn(spawnName, 1) != OK)
		if (roleClaimer.spawn(spawnName, 2) != OK)
		if (roleStoremanager.spawn(spawnName, 2) != OK)
			; //DO NOTHING
	} else { //large - 20 extension and up
		//large domestic types
		if (roleHarvester.spawn(spawnName, 5, 'large', null, null) != OK)
		if (roleBuilder.spawn(spawnName, 10, 'large', null, null) != OK)
		if (roleUpgrader.spawn(spawnName, 5, 'large', null, null) != OK)
		if (roleRepairer.spawn(spawnName, 10, 'medium', 0, null) != OK)

		//strong combat types
		if (roleScout.spawn(spawnName, 2, 'large') != OK)
		if (roleScavenger.spawn(spawnName, 1, 'large') != OK)

		//utility types
		if (roleSignwriter.spawn(spawnName, 1) != OK)
		if (roleClaimer.spawn(spawnName, 2) != OK)
		if (roleStoremanager.spawn(spawnName, 2) != OK)
			; //DO NOTHING
	}
}

profiler.enable();
module.exports.loop = function () {
	profiler.wrap(() => {
		handleSpawn('Spawn1');
	
		assignRoleRoutines();
	
		//delete memory of dead creeps
		for(const name in Memory.creeps) {
			if(!Game.creeps[name]) {
				delete Memory.creeps[name];
			}
		}
	});
}