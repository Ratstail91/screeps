const { HARVEST, UPGRADE, PICKUP, DEPOSIT, WITHDRAW, BUILD, REPAIR, PATROL, TARGET, FEAR, BRAVE, CRY, CARE, CLAIMER } = require('behaviour_names');
const { tinyBody, smallLorryBody, smallFightBody, mediumBody, mediumLorryBody, largeBody, largeFightBody, hugeBody, hugeSlowBody, claimerBody } = require('spawns.bodies');

const { getStores, TOWER, SPAWN, EXTENSION, CONTAINER, STORAGE, TERMINAL, TOMBSTONE } = require('utils.store');
const { autoBuild } = require('autobuilder');

const { spawnCreep } = require('creeps');
const market = require('market');

const { serialize } = require('behaviour.fear');

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

function getCreepsByOrigin(spawn) {
	const creeps = Object.values(Game.creeps)
		.filter(creep => !spawn || creep.memory.origin == spawn.name)
	;

	return creeps;
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

//spawn routines for each stage of the colony
function kickstart(spawn, creeps, population) {
	//NOTE: basic kickstart routine - assume 300 energy available

	creeps = creeps || getCreepsByOrigin(spawn);
	population = population || getPopulationByTags(creeps);

	//if the room has a storage that can be used
	if (spawn.room.storage && spawn.room.storage.store[RESOURCE_ENERGY] >= 100) {
		return spawnCreep(spawn, 'restocker', [DEPOSIT, WITHDRAW], tinyBody, ['restocker', 'kickstartRestocker'], {
			DEPOSIT: {
				stores: [TOWER, SPAWN, EXTENSION]
			},
			WITHDRAW: {
				stores: [CONTAINER, STORAGE]
			}
		});
	}

	//spawn harvesters
	if (!population.harvester || population.harvester < 5) {
		return spawnCreep(spawn, 'harvester', [CRY, FEAR, PICKUP, DEPOSIT, HARVEST, UPGRADE], tinyBody, ['harvester', 'kickstartHarvester'], {
			HARVEST: {
				remote: 0
			},
			DEPOSIT: {
				forceIfNotEmpty: true,
				returnHomeFirst: true
			},
			FEAR: {
				returnHome: true,
				onSafe: serialize(creep => {
					creep.memory['HARVEST'].remote = null;
					creep.memory['HARVEST'].source = null;
				})
			}
		});
	}

	//spawn upgraders
	if (!population.upgrader || population.upgrader < 2) {
		return spawnCreep(spawn, 'upgrader', [CRY, FEAR, HARVEST, UPGRADE], tinyBody, ['upgrader', 'kickstartUpgrader'], {
			FEAR: {
				returnHome: true,
				onSafe: serialize(creep => {
					creep.memory['HARVEST'].remote = null;
					creep.memory['HARVEST'].source = null;
				})
			}
		});
	}

	//fallback to harvesters
	return spawnCreep(spawn, 'harvester', [CRY, FEAR, DEPOSIT, HARVEST, UPGRADE], tinyBody, ['harvester', 'kickstartHarvester'], {
		DEPOSIT: {
			forceIfNotEmpty: true,
			returnHomeFirst: true
		},
		FEAR: {
			returnHome: true,
			onSafe: serialize(creep => {
				creep.memory['HARVEST'].remote = null;
				creep.memory['HARVEST'].source = null;
			})
		}
	});
}

function stage1(spawn, creeps, population) {
	creeps = creeps || getCreepsByOrigin(spawn);
	population = population || getPopulationByTags(creeps);

	//spawn harvesters
	if (!population.harvester || population.harvester < 10) {
		return spawnCreep(spawn, 'harvester', [CRY, FEAR, DEPOSIT, HARVEST, UPGRADE], tinyBody, ['harvester'], {
			DEPOSIT: {
				forceIfNotEmpty: true,
				returnHomeFirst: true
			},
			FEAR: {
				returnHome: true,
				onSafe: serialize(creep => {
					creep.memory['HARVEST'].remote = null;
					creep.memory['HARVEST'].source = null;
				})
			}
		});
	}

	//spawn upgraders
	if (!population.upgrader || population.upgrader < 5) {
		return spawnCreep(spawn, 'upgrader', [CRY, FEAR, HARVEST, UPGRADE], tinyBody, ['upgrader'], {
			FEAR: {
				returnHome: true,
				onSafe: serialize(creep => {
					creep.memory['HARVEST'].remote = null;
					creep.memory['HARVEST'].source = null;
				})
			}
		});
	}

	//spawn builders
	if (!population.builder || population.builder < 10) {
		return spawnCreep(spawn, 'builder', [CRY, FEAR, REPAIR, BUILD, DEPOSIT, HARVEST], tinyBody, ['builder'], {
			DEPOSIT: {
				forceIfNotEmpty: true,
				returnHomeFirst: true
			},
			FEAR: {
				returnHome: true,
				onSafe: serialize(creep => {
					creep.memory['HARVEST'].remote = null;
					creep.memory['HARVEST'].source = null;
				})
			}
		});
	}

	//fallback to harvesters
	if (!population.harvester || population.harvester < 20) {
		return spawnCreep(spawn, 'harvester', [CRY, FEAR, DEPOSIT, HARVEST, UPGRADE], tinyBody, ['harvester'], {
			DEPOSIT: {
				forceIfNotEmpty: true,
				returnHomeFirst: true
			},
			FEAR: {
				returnHome: true,
				onSafe: serialize(creep => {
					creep.memory['HARVEST'].remote = null;
					creep.memory['HARVEST'].source = null;
				})
			}
		});
	}

	//nothing happened
	return null;
}

function stage2(spawn, creeps, population) {
	creeps = creeps || getCreepsByOrigin(spawn);
	population = population || getPopulationByTags(creeps);

	//spawn scouts
	if (!population.scout || population.scout < 2 || Memory._cries.length > 0 || Game.flags['rallypoint']) {
		return spawnCreep(spawn, 'scout', [CRY, TARGET, BRAVE, CARE, PATROL], smallFightBody, ['scout', 'combat'], {
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

/*
	//spawn scavengers
	if (!population.scavenger) {
		return spawnCreep(spawn, 'scavenger', [CRY, TARGET, PICKUP, DEPOSIT, WITHDRAW], smallLorryBody, ['scavenger'], {
			TARGET: {
				targetFlag: 'collectionpoint'
			},
			WITHDRAW: {
				stores: [TOMBSTONE, STORAGE, CONTAINER]
			},
			DEPOSIT: {
				returnHomeFirst: true
			}
		});
	}
*/

	//fall back to stage 1
	return stage1(spawn, creeps, population);
}

function stage3(spawn, creeps, population) {
	creeps = creeps || getCreepsByOrigin(spawn);
	population = population || getPopulationByTags(creeps);

	//spawn scouts
	if (!population.scout || population.scout < 2 || Memory._cries.length > 0 || Game.flags['rallypoint']) {
		return spawnCreep(spawn, 'scout', [CRY, TARGET, BRAVE, CARE, PATROL], smallFightBody, ['scout', 'combat'], {
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

/*
	//spawn scavengers
	if (!population.scavenger) {
		return spawnCreep(spawn, 'scavenger', [CRY, TARGET, PICKUP, DEPOSIT, WITHDRAW], smallLorryBody, ['scavenger'], {
			TARGET: {
				targetFlag: 'collectionpoint'
			},
			WITHDRAW: {
				stores: [TOMBSTONE, STORAGE, CONTAINER]
			},
			DEPOSIT: {
				returnHomeFirst: true
			}
		});
	}
*/

	//spawn medium harvesters
	if (!population.harvester || (population.harvester - population.kickstartHarvester || population.harvester) < 10) {
		return spawnCreep(spawn, 'harvester', [CRY, FEAR, DEPOSIT, HARVEST, UPGRADE], mediumBody, ['harvester'], {
			DEPOSIT: {
				forceIfNotEmpty: true,
				returnHomeFirst: true
			},
			FEAR: {
				returnHome: true,
				onSafe: serialize(creep => {
					creep.memory['HARVEST'].remote = null;
					creep.memory['HARVEST'].source = null;
				})
			}
		});
	}

	//spawn medium upgraders
	if (!population.upgrader || (population.upgrader - population.kickstartUpgrader || population.upgrader) < 5) {
		return spawnCreep(spawn, 'upgrader', [CRY, FEAR, HARVEST, UPGRADE], mediumBody, ['upgrader'], {
			FEAR: {
				returnHome: true,
				onSafe: serialize(creep => {
					creep.memory['HARVEST'].remote = null;
					creep.memory['HARVEST'].source = null;
				})
			}
		});
	}

	//spawn medium builders
	if (!population.builder || population.builder < 10) {
		return spawnCreep(spawn, 'builder', [CRY, FEAR, REPAIR, BUILD, DEPOSIT, HARVEST], mediumBody, ['builder'], {
			DEPOSIT: {
				forceIfNotEmpty: true,
				returnHomeFirst: true
			},
			FEAR: {
				returnHome: true,
				onSafe: serialize(creep => {
					creep.memory['HARVEST'].remote = null;
					creep.memory['HARVEST'].source = null;
				})
			}
		});
	}

	//fallback to harvesters
	if (!population.harvester || (population.harvester - population.kickstartHarvester || population.harvester) < 20) {
		return spawnCreep(spawn, 'harvester', [CRY, FEAR, DEPOSIT, HARVEST, UPGRADE], mediumBody, ['harvester'], {
			DEPOSIT: {
				forceIfNotEmpty: true,
				returnHomeFirst: true
			},
			FEAR: {
				returnHome: true,
				onSafe: serialize(creep => {
					creep.memory['HARVEST'].remote = null;
					creep.memory['HARVEST'].source = null;
				})
			}
		});
	}

	//nothing happened
	return null;
}

function stage4(spawn, creeps, population) {
	creeps = creeps || getCreepsByOrigin(spawn);
	population = population || getPopulationByTags(creeps);

	//spawn large scouts
	if (!population.scout || population.scout < 2 || Memory._cries.length > 0 || Game.flags['rallypoint']) {
		return spawnCreep(spawn, 'scout', [CRY, TARGET, BRAVE, CARE, PATROL], largeFightBody, ['scout', 'combat'], {
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

/*
	//spawn medium scavengers
	if (!population.scavenger) {
		return spawnCreep(spawn, 'scavenger', [CRY, TARGET, PICKUP, DEPOSIT, WITHDRAW], mediumLorryBody, ['scavenger'], {
			TARGET: {
				targetFlag: 'collectionpoint'
			},
			WITHDRAW: {
				stores: [TOMBSTONE, STORAGE, CONTAINER]
			},
			DEPOSIT: {
				forceIfNotEmpty: true,
				returnHomeFirst: true
			}
		});
	}
*/

	//check for 'claimme' flag
	if (Game.flags['claimme']) {
		let population = getPopulationByTags(getCreepsByOrigin(null));

		//spawn 1 claimer
		if (!population.claimer) {
			return spawnCreep(spawn, 'claimer', [CRY, TARGET, CLAIMER], claimerBody, ['claimer'], {
				TARGET: {
					targetFlag: 'claimme',
					stopInRoom: true
				}
			});
		}

		//spawn medium colonists
		if (!population.colonist || population.colonist < 10) {
			return spawnCreep(spawn, 'colonist', [CRY, FEAR, TARGET, REPAIR, BUILD, DEPOSIT, HARVEST], mediumBody, ['colonist'], {
				TARGET: {
					targetFlag: 'claimme',
					stopInRoom: true
				},
				DEPOSIT: {
					forceIfNotEmpty: true,
					returnHomeFirst: true
				},
				FEAR: {
					returnHome: true,
					onSafe: serialize(creep => {
						creep.memory['HARVEST'].remote = null;
						creep.memory['HARVEST'].source = null;
					})
				}
			});
		}
	}

	//spawn medium harvesters
	if (!population.harvester || (population.harvester - population.kickstartHarvester || population.harvester) < 10) {
		return spawnCreep(spawn, 'harvester', [CRY, FEAR, DEPOSIT, HARVEST, UPGRADE], mediumBody, ['harvester'], {
			DEPOSIT: {
				forceIfNotEmpty: true,
				returnHomeFirst: true
			},
			FEAR: {
				returnHome: true,
				onSafe: serialize(creep => {
					creep.memory['HARVEST'].remote = null;
					creep.memory['HARVEST'].source = null;
				})
			}
		});
	}

	//spawn large upgraders
	if (!population.upgrader || (population.upgrader - population.kickstartUpgrader || population.upgrader) < 5) {
		return spawnCreep(spawn, 'upgrader', [CRY, FEAR, HARVEST, UPGRADE], largeBody, ['upgrader'], {
			FEAR: {
				returnHome: true,
				onSafe: serialize(creep => {
					creep.memory['HARVEST'].remote = null;
					creep.memory['HARVEST'].source = null;
				})
			}
		});
	}

	//spawn large builders
	if (!population.builder || population.builder < 5) {
		return spawnCreep(spawn, 'builder', [CRY, FEAR, REPAIR, BUILD, DEPOSIT, HARVEST], largeBody, ['builder'], {
			DEPOSIT: {
				forceIfNotEmpty: true,
				returnHomeFirst: true
			},
			FEAR: {
				returnHome: true,
				onSafe: serialize(creep => {
					creep.memory['HARVEST'].remote = null;
					creep.memory['HARVEST'].source = null;
				})
			}
		});
	}

	//fallback to large harvesters
	if (!population.harvester || (population.harvester - population.kickstartHarvester || population.harvester) < 30) {
		return spawnCreep(spawn, 'harvester', [CRY, FEAR, DEPOSIT, HARVEST, UPGRADE], largeBody, ['harvester'], {
			DEPOSIT: {
				forceIfNotEmpty: true,
				returnHomeFirst: true
			},
			FEAR: {
				returnHome: true,
				onSafe: serialize(creep => {
					creep.memory['HARVEST'].remote = null;
					creep.memory['HARVEST'].source = null;
				})
			}
		});
	}

	//no fall through this time
	return null;
}

function stage5(spawn, creeps, population) {
	creeps = creeps || getCreepsByOrigin(spawn);
	population = population || getPopulationByTags(creeps);

	//spawn large scouts
	if (!population.scout || population.scout < 2 || Memory._cries.length > 0 || Game.flags['rallypoint']) {
		return spawnCreep(spawn, 'scout', [CRY, TARGET, BRAVE, CARE, PATROL], largeFightBody, ['scout', 'combat'], {
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

/*
	//spawn medium scavengers
	if (!population.scavenger) {
		return spawnCreep(spawn, 'scavenger', [CRY, TARGET, PICKUP, DEPOSIT, WITHDRAW], mediumLorryBody, ['scavenger'], {
			TARGET: {
				targetFlag: 'collectionpoint',
				stopInRoom: true
			},
			WITHDRAW: {
				stores: [TOMBSTONE, STORAGE, CONTAINER]
			},
			DEPOSIT: {
				forceIfNotEmpty: true,
				returnHomeFirst: true
			}
		});
	}
*/

	//check for 'claimme' flag
	if (Game.flags['claimme']) {
		let population = getPopulationByTags(getCreepsByOrigin(null));

		//spawn 1 claimer
		if (!population.claimer) {
			return spawnCreep(spawn, 'claimer', [CRY, TARGET, CLAIMER], claimerBody, ['claimer'], {
				TARGET: {
					targetFlag: 'claimme',
					stopInRoom: true
				}
			});
		}

		//spawn medium colonists
		if (!population.colonist || population.colonist < 10) {
			return spawnCreep(spawn, 'colonist', [CRY, FEAR, TARGET, REPAIR, BUILD, DEPOSIT, HARVEST], mediumBody, ['colonist'], {
				TARGET: {
					targetFlag: 'claimme',
					stopInRoom: true
				},
				DEPOSIT: {
					forceIfNotEmpty: true,
					returnHomeFirst: true
				},
				FEAR: {
					returnHome: true,
					onSafe: serialize(creep => {
						creep.memory['HARVEST'].remote = null;
						creep.memory['HARVEST'].source = null;
					})
				}
			});
		}
	}

	//spawn medium harvesters
	if (!population.harvester || (population.harvester - population.kickstartHarvester || population.harvester) < 2) {
		return spawnCreep(spawn, 'harvester', [CRY, FEAR, DEPOSIT, HARVEST, UPGRADE], mediumBody, ['harvester'], {
			DEPOSIT: {
				forceIfNotEmpty: true,
				returnHomeFirst: true
			},
			FEAR: {
				returnHome: true,
				onSafe: serialize(creep => {
					creep.memory['HARVEST'].remote = null;
					creep.memory['HARVEST'].source = null;
				})
			}
		});
	}

	//spawn huge harvesters
	if (!population.harvester || (population.harvester - population.kickstartHarvester || population.harvester) < 5) {
		return spawnCreep(spawn, 'harvester', [CRY, FEAR, DEPOSIT, HARVEST, UPGRADE], hugeBody, ['harvester'], {
			DEPOSIT: {
				forceIfNotEmpty: true,
				returnHomeFirst: true
			},
			FEAR: {
				returnHome: true,
				onSafe: serialize(creep => {
					creep.memory['HARVEST'].remote = null;
					creep.memory['HARVEST'].source = null;
				})
			}
		});
	}

	//spawn huge upgraders
	if (!population.upgrader || (population.upgrader - population.kickstartUpgrader || population.upgrader) < 5) {
		return spawnCreep(spawn, 'upgrader', [CRY, FEAR, HARVEST, UPGRADE], hugeBody, ['upgrader'], {
			FEAR: {
				returnHome: true,
				onSafe: serialize(creep => {
					creep.memory['HARVEST'].remote = null;
					creep.memory['HARVEST'].source = null;
				})
			}
		});
	}

	//spawn huge builders
	if (!population.builder || population.builder < 5) {
		return spawnCreep(spawn, 'builder', [CRY, FEAR, REPAIR, BUILD, DEPOSIT, HARVEST], hugeBody, ['builder'], {
			DEPOSIT: {
				forceIfNotEmpty: true,
				returnHomeFirst: true
			},
			FEAR: {
				returnHome: true,
				onSafe: serialize(creep => {
					creep.memory['HARVEST'].remote = null;
					creep.memory['HARVEST'].source = null;
				})
			}
		});
	}

	//fallback to huge harvesters
	if (!population.harvester || (population.harvester - population.kickstartHarvester || population.harvester) < 30) {
		return spawnCreep(spawn, 'harvester', [CRY, FEAR, DEPOSIT, HARVEST, UPGRADE], hugeBody, ['harvester'], {
			DEPOSIT: {
				forceIfNotEmpty: true,
				returnHomeFirst: true
			},
			FEAR: {
				returnHome: true,
				onSafe: serialize(creep => {
					creep.memory['HARVEST'].remote = null;
					creep.memory['HARVEST'].source = null;
				})
			}
		});
	}

	//no fall through this time
	return null;
}

function stage6(spawn, creeps, population) {
	creeps = creeps || getCreepsByOrigin(spawn);
	population = population || getPopulationByTags(creeps);

	if (!population.trader || population.trader < 2) {
		return spawnCreep(spawn, 'trader', [CRY, WITHDRAW, BUILD, DEPOSIT], hugeSlowBody, ['trader'], {
			WITHDRAW: {
				skipIfNotEmpty: true,
				stores: [STORAGE]
			},
			DEPOSIT: {
				stores: [TERMINAL]
			}
		});
	}

	//fallback for now
	return stage5(spawn, creeps, population);
}

function stage7(spawn, creeps, population) {
	//TODO
}

function stage8(spawn, creeps, population) {
	//TODO
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
	if (creeps.length < 10) {
		return kickstart(spawn);
	}

	//stages 7 & 8 are not yet implemented

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
