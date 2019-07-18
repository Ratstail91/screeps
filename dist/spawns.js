const { HARVEST, UPGRADE, PICKUP, DEPOSIT, WITHDRAW, BUILD, REPAIR, PATROL, TARGET, FEAR, BRAVE, CRY, CARE, CLAIMER } = require('behaviour_names');
const { tinyBody, smallLorryBody, smallFightBody, mediumBody, mediumLorryBody, largeBody, largeFightBody, hugeBody, hugeSlowBody, claimerBody } = require('spawns.bodies');

const { getStores, TOWER, SPAWN, EXTENSION, CONTAINER, STORAGE, TERMINAL, TOMBSTONE } = require('utils.store');
const { autoBuild } = require('autobuilder');

const { spawnCreep } = require('creeps');
const market = require('market');

const { serialize } = require('behaviour.fear');

function getCreepsByOrigin(spawn) {
	const creeps = Object.values(Game.creeps)
		.filter(creep => !spawn || creep.memory.origin == spawn.name)
	;

	return creeps;
}

function getPopulationByTags(creeps = Game.creeps) {
	//known tags
	const population = {};

	//count all arbitrary tags (store them in tags, defined above)
	Object.values(creeps)
		.map(creep => creep.memory.tags)
		.forEach(tags => {
			tags.forEach(tag => population[tag] = population[tag] + 1 || 1)
		})
	;

	return population;
}

//defensive towers near spawn
function defendSpawn(spawn) {
	const hostiles = spawn.room.find(FIND_HOSTILE_CREEPS)
		.filter(c => c.pos.x > 0 && c.pos.x < 49 && c.pos.y > 0 && c.pos.y < 49)
	;

	if (hostiles.length == 0) {
		return;
	}

	const username = hostiles[0].owner.username;
	Game.notify(`User ${username} spotted near ${spawn.name}`);

	const towers = spawn.room.find(FIND_MY_STRUCTURES, { filter: (structure) => structure.structureType == STRUCTURE_TOWER });
	towers.forEach(tower => tower.attack(hostiles[0]));
}

//curried functions
function spawnHarvester(spawn, body, extraTags = []) {
	return spawnCreep(spawn, 'harvester', [CRY, FEAR, DEPOSIT, HARVEST, UPGRADE], body, ['harvester', ...extraTags], {
		FEAR: {
			returnHome: true,
			onSafe: serialize(creep => {
				creep.memory['HARVEST'].remote = null;
				creep.memory['HARVEST'].source = null;
			})
		},
		DEPOSIT: {
			forceIfNotEmpty: true,
			returnHomeFirst: true
		}
	});
}

function spawnUpgrader(spawn, body, extraTags = []) {
	return spawnCreep(spawn, 'upgrader', [CRY, FEAR, HARVEST, UPGRADE], body, ['upgrader', ...extraTags], {
		FEAR: {
			returnHome: true,
			onSafe: serialize(creep => {
				creep.memory['HARVEST'].remote = null;
				creep.memory['HARVEST'].source = null;
			})
		}
	});
}

function spawnBuilder(spawn, body, extraTags = []) {
	return spawnCreep(spawn, 'builder', [CRY, FEAR, REPAIR, BUILD, DEPOSIT, HARVEST], body, ['builder', ...extraTags], {
		FEAR: {
			returnHome: true,
			onSafe: serialize(creep => {
				creep.memory['HARVEST'].remote = null;
				creep.memory['HARVEST'].source = null;
			})
		},
		DEPOSIT: {
			forceIfNotEmpty: true,
			returnHomeFirst: true
		}
	});
}

function spawnScout(spawn, body, extraTags = []) {
	return spawnCreep(spawn, 'scout', [CRY, TARGET, BRAVE, CARE, PATROL], body, ['scout', 'combat', ...extraTags], {
		TARGET: {
			targetFlag: 'rallypoint'
		},
		PATROL: {
			targetFlags: [
				`${spawn.name}remote0`,
				`${spawn.name}remote1`,
				`${spawn.name}remote2`,
				`${spawn.name}remote3`
			]
		}
	});
}

function spawnScavenger(spawn, body, extraTags = []) {
	return spawnCreep(spawn, 'scavenger', [CRY, TARGET, PICKUP, DEPOSIT, WITHDRAW], body, ['scavenger', ...extraTags], {
		TARGET: {
			targetFlag: 'collectionpoint'
		},
		DEPOSIT: {
			returnHomeFirst: true
		},
		WITHDRAW: {
			stores: [TOMBSTONE, STORAGE, CONTAINER]
		}
	});
}

function spawnClaimer(spawn, body, extraTags = []) {
	return spawnCreep(spawn, 'claimer', [CRY, TARGET, CLAIMER], body, ['claimer', ...extraTags], {
		TARGET: {
			targetFlag: 'claimme',
			stopInRoom: true
		}
	});
}

function spawnColonist(spawn, body, extraTags = []) {
	return spawnCreep(spawn, 'colonist', [CRY, FEAR, TARGET, REPAIR, BUILD, DEPOSIT, HARVEST], body, ['colonist', ...extraTags], {
		FEAR: {
			returnHome: true,
			onSafe: serialize(creep => {
				creep.memory['HARVEST'].remote = null;
				creep.memory['HARVEST'].source = null;
			})
		},
		TARGET: {
			targetFlag: 'claimme',
			stopInRoom: true
		},
		DEPOSIT: {
			forceIfNotEmpty: true,
			returnHomeFirst: true
		}
	});
}

function spawnTrader(spawn, body, extraTags = []) {
	return spawnCreep(spawn, 'trader', [CRY, WITHDRAW, BUILD, DEPOSIT], body, ['trader', ...extraTags], {
		WITHDRAW: {
			skipIfNotEmpty: true,
			stores: [STORAGE]
		},
		DEPOSIT: {
			stores: [TERMINAL]
		}
	});
}

function spawnRestocker(spawn, body, extraTags = []) {
	return spawnCreep(spawn, 'restocker', [DEPOSIT, WITHDRAW], body, ['restocker', ...extraTags], {
		DEPOSIT: {
			stores: [TOWER, SPAWN, EXTENSION]
		},
		WITHDRAW: {
			stores: [CONTAINER, STORAGE]
		}
	});
}

//spawn routines for each stage of the colony
function kickstart(spawn, creeps, population) {
	//NOTE: basic kickstart routine - assume 300 energy available

	creeps = creeps || getCreepsByOrigin(spawn);
	population = population || getPopulationByTags(creeps);

	//if the room has a storage that can be used
	if (spawn.room.storage && spawn.room.storage.store[RESOURCE_ENERGY] >= 100) {
		return spawnRestocker(spawn, tinyBody, ['kickstart', 'kickstartRestocker'])
	}

	//spawn harvesters
	if (!population.harvester || population.harvester < 5) {
		return spawnHarvester(spawn, tinyBody, ['kickstart', 'kickstartHarvester']);
	}

	//spawn upgraders
	if (!population.upgrader || population.upgrader < 2) {
		return spawnUpgrader(spawn, tinyBody, ['kickstart', 'kickstartUpgrader']);
	}

	//fallback to harvesters
	return spawnHarvester(spawn, tinyBody, ['kickstart', 'kickstartHarvester']);
}

function stage1(spawn, creeps, population) {
	creeps = creeps || getCreepsByOrigin(spawn);
	population = population || getPopulationByTags(creeps);

	//spawn harvesters
	if (!population.harvester || population.harvester < 10) {
		return spawnHarvester(spawn, tinyBody);
	}

	//spawn upgraders
	if (!population.upgrader || population.upgrader < 5) {
		return spawnUpgrader(spawn, tinyBody);
	}

	//spawn builders
	if (!population.builder || population.builder < 10) {
		return spawnBuilder(spawn, tinyBody);
	}

	//fallback to harvesters
	if (!population.harvester || population.harvester < 30) {
		return spawnHarvester(spawn, tinyBody);
	}

	//nothing happened
	return null;
}

function stage2(spawn, creeps, population) {
	creeps = creeps || getCreepsByOrigin(spawn);
	population = population || getPopulationByTags(creeps);

	//spawn scouts
	if (!population.scout || population.scout < 2 || Memory._cries.length > 0 || Game.flags['rallypoint']) {
		return spawnScout(spawn, smallFightBody);
	}

	//spawn scavengers
	if (!population.scavenger) {
		return spawnScavenger(spawn, smallLorryBody);
	}

	//fall back to stage 1
	return stage1(spawn, creeps, population);
}

function stage3(spawn, creeps, population) {
	creeps = creeps || getCreepsByOrigin(spawn);
	population = population || getPopulationByTags(creeps);

	//spawn scouts
	if (!population.scout || population.scout < 2 || Memory._cries.length > 0 || Game.flags['rallypoint']) {
		return spawnScout(spawn, smallFightBody);
	}

	//spawn scavengers
	if (!population.scavenger) {
		return spawnScavenger(spawn, tinyLorryBody);
	}

	//spawn medium harvesters
	if (!population.harvester || (population.harvester - population.kickstartHarvester || population.harvester) < 10) {
		return spawnHarvester(spawn, mediumBody);
	}

	//spawn medium upgraders
	if (!population.upgrader || (population.upgrader - population.kickstartUpgrader || population.upgrader) < 5) {
		return spawnUpgrader(spawn, mediumBody);
	}

	//spawn medium builders
	if (!population.builder || population.builder < 10) {
		return spawnBuilder(spawn, mediumBody);
	}

	//fallback to harvesters
	if (!population.harvester || (population.harvester - population.kickstartHarvester || population.harvester) < 20) {
		return spawnHarvester(spawn, mediumBody);
	}

	//nothing happened
	return null;
}

function stage4(spawn, creeps, population) {
	creeps = creeps || getCreepsByOrigin(spawn);
	population = population || getPopulationByTags(creeps);

	//spawn large scouts
	if (!population.scout || population.scout < 2 || Memory._cries.length > 0 || Game.flags['rallypoint']) {
		return spawnScout(spawn, largeFightBody);
	}

	//spawn medium scavengers
	if (!population.scavenger) {
		return spawnScavenger(spawn, mediumLorryBody);
	}

	//check for 'claimme' flag
	if (Game.flags['claimme']) {
		//global population
		let population = getPopulationByTags(getCreepsByOrigin(null));

		//spawn 1 claimer
		if (!population.claimer) {
			return spawnClaimer(spawn, claimerBody);
		}

		//spawn medium colonists
		if (!population.colonist || population.colonist < 10) {
			return spawnColonist(spawn, mediumBody);
		}
	}

	//spawn medium harvesters
	if (!population.harvester || (population.harvester - population.kickstartHarvester || population.harvester) < 10) {
		return spawnHarvester(spawn, mediumBody);
	}

	//spawn large upgraders
	if (!population.upgrader || (population.upgrader - population.kickstartUpgrader || population.upgrader) < 5) {
		return spawnUpgrader(spawn, largeBody);
	}

	//spawn large builders
	if (!population.builder || population.builder < 5) {
		return spawnBuilder(spawn, largeBody);
	}

	//fallback to large harvesters
	if (!population.harvester || (population.harvester - population.kickstartHarvester || population.harvester) < 30) {
		return spawnHarvester(spawn, largeBody);
	}

	//no fall through this time
	return null;
}

function stage5(spawn, creeps, population) {
	creeps = creeps || getCreepsByOrigin(spawn);
	population = population || getPopulationByTags(creeps);

	//spawn large scouts
	if (!population.scout || population.scout < 2 || Memory._cries.length > 0 || Game.flags['rallypoint']) {
		return spawnScout(spawn, largeFightBody);
	}

	//spawn medium scavengers
	if (!population.scavenger) {
		return spawnScavenger(spawn, mediumLorryBody);
	}

	//check for 'claimme' flag
	if (Game.flags['claimme']) {
		//global population
		let population = getPopulationByTags(getCreepsByOrigin(null));

		//spawn 1 claimer
		if (!population.claimer) {
			return spawnClaimer(spawn, claimerBody);
		}

		//spawn medium colonists
		if (!population.colonist || population.colonist < 10) {
			return spawnColonist(spawn, mediumBody);
		}
	}

	//spawn medium harvesters
	if (!population.harvester || (population.harvester - population.kickstartHarvester || population.harvester) < 2) {
		return spawnHarvester(spawn, mediumBody);
	}

	//spawn huge harvesters
	if (!population.harvester || (population.harvester - population.kickstartHarvester || population.harvester) < 5) {
		return spawnHarvester(spawn, hugeBody);
	}

	//spawn huge upgraders
	if (!population.upgrader || (population.upgrader - population.kickstartUpgrader || population.upgrader) < 5) {
		return spawnUpgrader(spawn, hugeBody);
	}

	//spawn huge builders
	if (!population.builder || population.builder < 5) {
		return spawnBuilder(spawn, hugeBody);
	}

	//fallback to huge harvesters
	if (!population.harvester || (population.harvester - population.kickstartHarvester || population.harvester) < 30) {
		return spawnHarvester(spawn, hugeBody);
	}

	//no fall through this time
	return null;
}

function stage6(spawn, creeps, population) {
	creeps = creeps || getCreepsByOrigin(spawn);
	population = population || getPopulationByTags(creeps);

	if (!population.trader || population.trader < 2) {
		return spawnTrader(spawn, hugeSlowBody);
	}

	//fallback for now
	//TODO: more
	return stage5(spawn, creeps, population);
}

function stage7(spawn, creeps, population) {
	//TODO: haven't reached this point
}

function stage8(spawn, creeps, population) {
	//TODO: haven't reached this point
}

function handleSpawn(spawn) {
//console.log(spawn.name, JSON.stringify(getPopulationByTags(getCreepsByOrigin(spawn))));

	//remove 'claimme' flag (this room has been claimed)
	spawn.room.find(FIND_FLAGS, { filter: f => f.name == 'claimme'}).forEach(f => f.remove());

	//build spawn
	autoBuild(spawn, 'basic');

	//defend the spawn!
	defendSpawn(spawn);

	//sell stuff
	const terminals = spawn.room.find(FIND_MY_STRUCTURES, { filter: s => s.structureType == STRUCTURE_TERMINAL });
	if (terminals.length !== 0) {
		market(terminals[0]);
	}

	//skip this spawn if it's spawning
	if (spawn.spawning) {
		return;
	}

	//get the creep count
	const creeps = getCreepsByOrigin(spawn);

	//emergency
	if (creeps.length < 15) {
		return kickstart(spawn);
	}

	//TODO: stages 7 & 8 are not yet implemented

	if (spawn.room.energyCapacityAvailable >= 2300) {
		return stage6(spawn, creeps);
	}

	if (spawn.room.energyCapacityAvailable >= 1800) {
		return stage5(spawn, creeps);
	}

	if (spawn.room.energyCapacityAvailable >= 1300) {
		return stage4(spawn, creeps);
	}

	if (spawn.room.energyCapacityAvailable >= 800) {
		return stage3(spawn, creeps);
	}

	if (spawn.room.energyCapacityAvailable >= 550) {
		return stage2(spawn, creeps);
	}

	//300 energy available
	return stage1(spawn, creeps);
}

module.exports = handleSpawn;
