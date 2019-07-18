const { HARVEST, UPGRADE, PICKUP, DEPOSIT, WITHDRAW, BUILD, REPAIR, PATROL, TARGET, FEAR, BRAVE, CRY, CARE, CLAIMER } = require('behaviour_names');

const { TOWER, SPAWN, EXTENSION, CONTAINER, STORAGE, TERMINAL, TOMBSTONE } = require('utils.store');
const { spawnCreep } = require('creeps');
const { serialize } = require('behaviour.fear');

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

module.exports = {
	spawnHarvester,
	spawnUpgrader,
	spawnBuilder,
	spawnScout,
	spawnScavenger,
	spawnClaimer,
	spawnColonist,
	spawnTrader,
	spawnRestocker
};