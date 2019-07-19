const { HARVEST, UPGRADE, PICKUP, DROP, DEPOSIT, WITHDRAW, BUILD, REPAIR, PATROL, TARGET, FEAR, BRAVE, CRY, CARE, CLAIMER } = require('behaviour_names');

const { TOWER, SPAWN, EXTENSION, CONTAINER, STORAGE, TERMINAL, TOMBSTONE } = require('utils.store');
const { spawnCreep } = require('creeps');
const { serialize } = require('behaviour.fear');

//generic all-rounders
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

//combat types
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
				`${spawn.name}remote3`,
				`${spawn.name}remote4`,
				`${spawn.name}remote5`,
				`${spawn.name}remote6`,
				`${spawn.name}remote7`,
				`${spawn.name}remote8`,
				`${spawn.name}remote9`
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

//expansion types
function spawnClaimer(spawn, body, extraTags = []) {
	return spawnCreep(spawn, 'claimer', [CRY, TARGET, CLAIMER], body, ['claimer', ...extraTags], {
		TARGET: {
			targetFlag: `${spawn.name}claimme`,
			stopInRoom: true
		},
		CLAIMER: {
			claim: true
		}
	});
}

function spawnReserver(spawn, body, extraTags = []) {
	return spawnCreep(spawn, 'reserver', [CRY, TARGET, CLAIMER], body, ['reserver', ...extraTags], {
		TARGET: {
			targetFlag: `${spawn.name}reserveme`,
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

//bespoke
function spawnRestocker(spawn, body, extraTags = []) {
	return spawnCreep(spawn, 'restocker', [DEPOSIT, PICKUP, WITHDRAW], body, ['restocker', ...extraTags], {
		DEPOSIT: {
			returnHomeFirst: true,
			stores: [TOWER, SPAWN, EXTENSION, TERMINAL]
		},
		WITHDRAW: {
			stores: [TOMBSTONE, CONTAINER, STORAGE]
		}
	});
}

function spawnLorry(spawn, body, extraTags = []) {
	return spawnCreep(spawn, 'lorry', [CRY, FEAR, DEPOSIT, WITHDRAW, PATROL], body, ['lorry', ...extraTags], {
		FEAR: {
			returnHome: true
		},
		DEPOSIT: {
			returnHomeFirst: true,
			stores: [STORAGE]
		},
		WITHDRAW: {
			stores: [CONTAINER]
		},
		PATROL: {
			targetFlags: [
				`${spawn.name}remote0`,
				`${spawn.name}remote1`,
				`${spawn.name}remote2`,
				`${spawn.name}remote3`,
				`${spawn.name}remote4`,
				`${spawn.name}remote5`,
				`${spawn.name}remote6`,
				`${spawn.name}remote7`,
				`${spawn.name}remote8`,
				`${spawn.name}remote9`
			]
		}
	});
}

function spawnThief(spawn, body, extraTags = []) {
	return spawnCreep(spawn, 'thief', [CRY, FEAR, DEPOSIT, WITHDRAW, TARGET], body, ['thief', ...extraTags], {
		FEAR: {
			returnHome: true
		},
		DEPOSIT: {
			returnHomeFirst: true,
			stores: [TOWER, SPAWN, EXTENSION, TERMINAL, STORAGE]
		},
		WITHDRAW: {
			skipOriginRoom: true,
			stores: [STORAGE]
		},
		TARGET: {
			stopInRoom: true,
			targetFlag: `${spawn.name}stealme`
		}
	});
}

//specialized alternatives
function spawnSpecializedHarvester(spawn, body, extraTags = []) {
	return spawnCreep(spawn, 'specializedHarvester', [CRY, DROP, HARVEST], body, ['harvester', 'specializedHarvester', ...extraTags]);
}

function spawnSpecializedUpgrader(spawn, body, extraTags = []) {
	return spawnCreep(spawn, 'specializedUpgrader', [CRY, WITHDRAW, UPGRADE], body, ['upgrader', 'specializedUpgrader', ...extraTags], {
		WITHDRAW: {
			stores: [STORAGE, CONTAINER]
		}
	});
}

function spawnSpecializedBuilder(spawn, body, extraTags = []) {
	return spawnCreep(spawn, 'specializedBuilder', [CRY, FEAR, BUILD, WITHDRAW, PATROL], body, ['builder', 'specializedBuilder', ...extraTags], {
		FEAR: {
			returnHome: true,
			onSafe: serialize(creep => {
				creep.memory['HARVEST'].remote = null;
				creep.memory['HARVEST'].source = null;
			})
		},
		WITHDRAW: {
			stores: [STORAGE, CONTAINER]
		},
		PATROL: {
			targetFlags: [
				`${spawn.name}remote0`,
				`${spawn.name}remote1`,
				`${spawn.name}remote2`,
				`${spawn.name}remote3`,
				`${spawn.name}remote4`,
				`${spawn.name}remote5`,
				`${spawn.name}remote6`,
				`${spawn.name}remote7`,
				`${spawn.name}remote8`,
				`${spawn.name}remote9`
			]
		}
	});
}

function spawnSpecializedRepairer(spawn, body, extraTags = []) {
	return spawnCreep(spawn, 'specializedRepairer', [CRY, FEAR, REPAIR, WITHDRAW, PATROL], body, ['repairer', 'specializedRepairer', ...extraTags], {
		FEAR: {
			returnHome: true
		},
		WITHDRAW: {
			stores: [STORAGE, CONTAINER]
		},
		PATROL: {
			targetFlags: [
				`${spawn.name}remote0`,
				`${spawn.name}remote1`,
				`${spawn.name}remote2`,
				`${spawn.name}remote3`,
				`${spawn.name}remote4`,
				`${spawn.name}remote5`,
				`${spawn.name}remote6`,
				`${spawn.name}remote7`,
				`${spawn.name}remote8`,
				`${spawn.name}remote9`
			]
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
	spawnReserver,
	spawnColonist,
	spawnRestocker,
	spawnLorry,
	spawnThief,
	spawnSpecializedHarvester,
	spawnSpecializedUpgrader,
	spawnSpecializedBuilder,
	spawnSpecializedRepairer,
};