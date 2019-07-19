const {
	spawnHarvester,
	spawnUpgrader,
	spawnBuilder,
	spawnScout,
	spawnScavenger,
	spawnClaimer,
	spawnReserver,
	spawnRestocker,
	spawnLorry,
	spawnThief,
	spawnSpecializedHarvester,
	spawnSpecializedUpgrader,
	spawnSpecializedBuilder,
	spawnSpecializedRepairer,
} = require('spawns.spawners');

const {
	tinyBody,
	smallLorryBody,
	smallFightBody,
	mediumBody,
	mediumLorryBody,
	largeBody,
	largeFightBody,
	largeLorryBody,
	largeSlowBody,
	hugeBody,
	hugeLorryBody,
	hugeSlowBody,
	claimerBody
} = require('spawns.bodies');

const { getCreepsByOrigin, getPopulationByTags } = require('utils.spawns');

//utility functions (you dun fucked up, thus this is necessary)
function firstNotNaN(...args) {
	//find the first argument that isn't NaN
	for (let i = 0; i < args.length; i++) {
		if (!Number.isNaN(args[i])) {
			return args[i];
		}
	}

	return NaN;
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
	if (!population.builder || population.builder < 2) {
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
	if (Memory._cries.length > 0 || Game.flags['rallypoint']) {
		return spawnScout(spawn, smallFightBody);
	}

//	//spawn scavengers
//	if (!population.scavenger) {
//		return spawnScavenger(spawn, smallLorryBody);
//	}

	//fall back to stage 1
	return stage1(spawn, creeps, population);
}

function stage3(spawn, creeps, population) {
	creeps = creeps || getCreepsByOrigin(spawn);
	population = population || getPopulationByTags(creeps);

	//spawn scouts
	if (Memory._cries.length > 0 || Game.flags['rallypoint']) {
		return spawnScout(spawn, smallFightBody);
	}

//	//spawn scavengers
//	if (!population.scavenger) {
//		return spawnScavenger(spawn, tinyLorryBody);
//	}

	//spawn medium harvesters
	if (!population.harvester || firstNotNaN(population.harvester - population.kickstartHarvester, population.harvester) < 10) {
		return spawnHarvester(spawn, mediumBody);
	}

	//spawn medium upgraders
	if (!population.upgrader || firstNotNaN(population.upgrader - population.kickstartUpgrader, population.upgrader) < 5) {
		return spawnUpgrader(spawn, mediumBody);
	}

	//spawn medium builders
	if (!population.builder || population.builder < 2) {
		return spawnBuilder(spawn, mediumBody);
	}

	//fallback to harvesters
	if (!population.harvester || firstNotNaN(population.harvester - population.kickstartHarvester, population.harvester) < 30) {
		return spawnHarvester(spawn, mediumBody);
	}

	//nothing happened
	return null;
}

function stage4(spawn, creeps, population) {
	creeps = creeps || getCreepsByOrigin(spawn);
	population = population || getPopulationByTags(creeps);

	//spawn large scouts
	if (Memory._cries.length > 0 || Game.flags['rallypoint']) {
		return spawnScout(spawn, largeFightBody);
	}

//	//spawn medium scavengers
//	if (!population.scavenger) {
//		return spawnScavenger(spawn, mediumLorryBody);
//	}

	//spawn large restockers
	if (!population.restocker || firstNotNaN(population.restocker - population.kickstartRestocker, population.restocker) < 2) {
		return spawnRestocker(spawn, largeLorryBody);
	}

	//check for 'reserveme' flag
	if (Game.flags[`${spawn.name}reserveme`]) {
		//spawn 1 reserver
		if (!population.reserver) {
			return spawnReserver(spawn, claimerBody);
		}
	}

	//check for 'claimme' flag
	if (Game.flags[`${spawn.name}claimme`]) {
		//spawn 1 claimer
		if (!population.claimer) {
			return spawnClaimer(spawn, claimerBody);
		}

		//spawn medium colonists
		if (!population.colonist || population.colonist < 10) {
			return spawnColonist(spawn, mediumBody);
		}
	}

	//check for 'stealme' flag
	if (Game.flags[`${spawn.name}stealme`]) {
		if (!population.thief || population.thief < 2) {
			return spawnThief(spawn, largeLorryBody);
		}
	}

	//spawn large specialized harvesters
	if (!population.harvester || firstNotNaN(population.harvester - population.kickstartHarvester, population.harvester) < 5) {
		return spawnSpecializedHarvester(spawn, largeSlowBody);
	}

	//spawn large lorries
	if (!population.lorry) {
		return spawnLorry(spawn, largeLorryBody);
	}

	//spawn large specialized builders
	if (!population.builder || population.builder < 2) {
		return spawnSpecializedBuilder(spawn, largeBody);
	}

	//spawn large specialized repairers
	if (!population.repairer || population.repairer < 2) {
		return spawnSpecializedRepairer(spawn, largeBody);
	}

	//spawn large specialized upgraders
	if (!population.upgrader || firstNotNaN(population.upgrader - population.kickstartUpgrader, population.upgrader) < 5) {
		return spawnSpecializedUpgrader(spawn, largeSlowBody);
	}

	//fallback to large specialized harvesters
	if (!population.harvester || firstNotNaN(population.harvester - population.kickstartHarvester, population.harvester) < 30) {
		return spawnSpecializedHarvester(spawn, largeSlowBody);
	}

	//no fall through this time
	return null;
}

function stage5(spawn, creeps, population) {
	creeps = creeps || getCreepsByOrigin(spawn);
	population = population || getPopulationByTags(creeps);

	//spawn large scouts
	if (Memory._cries.length > 0 || Game.flags['rallypoint']) {
		return spawnScout(spawn, largeFightBody);
	}

//	//spawn medium scavengers
//	if (!population.scavenger) {
//		return spawnScavenger(spawn, mediumLorryBody);
//	}

	//spawn huge restockers
	if (!population.restocker || firstNotNaN(population.restocker - population.kickstartRestocker, population.restocker) < 2) {
		return spawnRestocker(spawn, hugeLorryBody);
	}

	//check for 'reserveme' flag
	if (Game.flags[`${spawn.name}reserveme`]) {
		//spawn 1 reserver
		if (!population.reserver) {
			return spawnReserver(spawn, claimerBody);
		}
	}

	//check for 'claimme' flag
	if (Game.flags[`${spawn.name}claimme`]) {
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

	//check for 'stealme' flag
	if (Game.flags[`${spawn.name}stealme`]) {
		if (!population.thief || population.thief < 2) {
			return spawnThief(spawn, largeLorryBody);
		}
	}

	//spawn large specialized harvesters (a bit of bootstrapping)
	if (!population.harvester || firstNotNaN(population.harvester - population.kickstartHarvester, population.harvester) < 2) {
		return spawnSpecializedHarvester(spawn, largeSlowBody);
	}

	//spawn huge lorries
	if (!population.lorry) {
		return spawnLorry(spawn, hugeLorryBody);
	}

	//spawn huge specialized harvesters
	if (!population.harvester || firstNotNaN(population.harvester - population.kickstartHarvester, population.harvester) < 5) {
		return spawnSpecializedHarvester(spawn, hugeSlowBody);
	}

	//spawn huge specialized builders
	if (!population.builder || population.builder < 2) {
		return spawnSpecializedBuilder(spawn, hugeBody);
	}

	//spawn huge specialized repairers
	if (!population.repairer || population.repairer < 2) {
		return spawnSpecializedRepairer(spawn, hugeBody);
	}

	//spawn huge specialzied upgraders
	if (!population.upgrader || firstNotNaN(population.upgrader - population.kickstartUpgrader, population.upgrader) < 5) {
		return spawnSpecializedUpgrader(spawn, hugeSlowBody);
	}

	//fallback to huge specialized harvesters
	if (!population.harvester || firstNotNaN(population.harvester - population.kickstartHarvester, population.harvester) < 30) {
		return spawnSpecializedHarvester(spawn, hugeSlowBody);
	}

	//no fall through this time
	return null;
}

function stage6(spawn, creeps, population) {
	creeps = creeps || getCreepsByOrigin(spawn);
	population = population || getPopulationByTags(creeps);

	//TODO: fallback for now
	return stage5(spawn, creeps, population);
}

function stage7(spawn, creeps, population) {
	//TODO: haven't reached this point
}

function stage8(spawn, creeps, population) {
	//TODO: haven't reached this point
}

module.exports = {
	kickstart,
	stage1,
	stage2,
	stage3,
	stage4,
	stage5,
	stage6,
	stage7,
	stage8
};