const { spawnHarvester, spawnUpgrader, spawnBuilder, spawnScout, spawnScavenger, spawnClaimer, spawnTrader, spawnRestocker } = require('spawns.spawners');
const { tinyBody, smallLorryBody, smallFightBody, mediumBody, mediumLorryBody, largeBody, largeFightBody, hugeBody, hugeSlowBody, claimerBody } = require('spawns.bodies');
const { getCreepsByOrigin, getPopulationByTags } = require('utils.spawns');

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