const { HARVEST, UPGRADE, PICKUP, DEPOSIT, WITHDRAW, BUILD, REPAIR, PATROL, TARGET, FEAR, BRAVE, CRY, CARE, CLAIMER } = require('behaviour_names');
const { tinyBody, smallLorryBody, smallFightBody, mediumBody, mediumLorryBody, largeBody, largeFightBody, hugeBody, claimerBody } = require('spawns.bodies');
const { getStores, TOWER, SPAWN, EXTENSION, CONTAINER, STORAGE, TOMBSTONE } = require('utils.store');
const { autoBuild, placeConstructionSites } = require('autobuilder');

const { serialize } = require('behaviour.fear');

function spawnCreep(spawn, name, behaviours, body, tags, memory = {}) {
	//TODO: add verification, part matching between behaviours and body
	return spawn.spawnCreep(body, name + Game.time, { memory: _.merge(memory, {
		behaviours: behaviours,
		origin: spawn.name,
		tags: tags
	})});
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

function getCreepsByOrigin(spawn) {
	const creeps = Object.values(Game.creeps)
		.filter(creep => !spawn || creep.memory.origin == spawn.name)
	;

	return creeps;
}

//defensive towers near spawn
function defendSpawn(spawn) {
	const hostiles = spawn.room.find(FIND_HOSTILE_CREEPS);

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

	//spawn harvesters
	if (!population.harvester || population.harvester < 5) {
		return spawnCreep(spawn, 'harvester', [CRY, PICKUP, DEPOSIT, HARVEST], tinyBody, ['harvester', 'kickstartHarvester'], {
			HARVEST: {
				remote: 0
			},
			DEPOSIT: {
				forceIfNotEmpty: true,
				returnHomeFirst: true
			}
		});
	}

	//spawn upgraders
	if (!population.upgrader || population.upgrader < 2) {
		return spawnCreep(spawn, 'upgrader', [CRY, HARVEST, UPGRADE], tinyBody, ['upgrader', 'kickstartUpgrader']);
	}

	//fallback to harvesters
	return spawnCreep(spawn, 'harvester', [CRY, DEPOSIT, HARVEST], tinyBody, ['harvester', 'kickstartHarvester'], {
		DEPOSIT: {
			forceIfNotEmpty: true,
			returnHomeFirst: true
		}
	});
}

function stage1(spawn, creeps, population) {
	creeps = creeps || getCreepsByOrigin(spawn);
	population = population || getPopulationByTags(creeps);

	//spawn harvesters
	if (!population.harvester || population.harvester < 5) {
		return spawnCreep(spawn, 'harvester', [CRY, DEPOSIT, HARVEST], tinyBody, ['harvester'], {
			DEPOSIT: {
				forceIfNotEmpty: true,
				returnHomeFirst: true
			}
		});
	}

	//spawn upgraders
	if (!population.upgrader || population.upgrader < 2) {
		return spawnCreep(spawn, 'upgrader', [CRY, HARVEST, UPGRADE], tinyBody, ['upgrader']);
	}

	//spawn builders
	if (!population.builder || population.builder < 5) {
		return spawnCreep(spawn, 'builder', [CRY, REPAIR, BUILD, DEPOSIT, HARVEST], tinyBody, ['builder'], {
			DEPOSIT: {
				forceIfNotEmpty: true,
				returnHomeFirst: true
			}
		});
	}

	//fallback to harvesters
	if (!population.harvester || population.harvester < 20) {
		return spawnCreep(spawn, 'harvester', [CRY, DEPOSIT, HARVEST], tinyBody, ['harvester'], {
			DEPOSIT: {
				forceIfNotEmpty: true,
				returnHomeFirst: true
			}
		});
	}
}

function stage2(spawn, creeps, population) {
	creeps = creeps || getCreepsByOrigin(spawn);
	population = population || getPopulationByTags(creeps);

	//spawn scouts
	if (!population.scout || population.scout < 2) {
		return spawnCreep(spawn, 'scout', [BRAVE, CARE, TARGET, PATROL], smallFightBody, ['scout', 'combat'], {
			TARGET: {
				targetFlag: 'rallypoint',
				override: true
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

	//spawn scavengers
	if (!population.scavenger) {
		return spawnCreep(spawn, 'scavenger', [CRY, TARGET, PICKUP, WITHDRAW, DEPOSIT], smallLorryBody, ['scavenger'], {
			TARGET: {
				targetFlag: 'rallypoint',
				override: true
			},
			WITHDRAW: {
				stores: [TOMBSTONE, STORAGE, CONTAINER]
			},
			DEPOSIT: {
				returnHomeFirst: true
			}
		});
	}

	//fall back to stage 1
	return stage1(spawn, creeps, population);
}

function stage3(spawn, creeps, population) {
	creeps = creeps || getCreepsByOrigin(spawn);
	population = population || getPopulationByTags(creeps);

	//spawn harvesters
	if (!population.harvester || population.harvester - population.kickstartHarvester < 5) {
		return spawnCreep(spawn, 'harvester', [CRY, DEPOSIT, HARVEST], mediumBody, ['harvester'], {
			DEPOSIT: {
				forceIfNotEmpty: true,
				returnHomeFirst: true
			}
		});
	}

	//spawn medium restockers
	const totalSpareEnergy = getStores(spawn, [CONTAINER, STORAGE])
		.reduce((total, store) => store.store[RESOURCE_ENERGY], 0)
	;

	if ((!population.restocker || population.restocker < 2) && totalSpareEnergy >= 1000) {
		return spawnCreep(spawn, 'restocker', [CRY, DEPOSIT, WITHDRAW], mediumLorryBody, ['restocker'], {
			DEPOSIT: {
				forceIfNotEmpty: true,
				returnHomeFirst: true,
				stores: [TOWER, SPAWN, EXTENSION]
			},
			WITHDRAW: {
				skipOwnRoom: false,
				stores: [TOMBSTONE, CONTAINER, STORAGE]
			}
		});
	}

	//spawn upgraders
	if (!population.upgrader || population.upgrader - population.kickstartUpgrader < 2) {
		return spawnCreep(spawn, 'upgrader', [CRY, HARVEST, UPGRADE], mediumBody, ['upgrader']);
	}

	//spawn builders
	if (!population.builder || population.builder < 5) {
		return spawnCreep(spawn, 'builder', [CRY, REPAIR, BUILD, DEPOSIT, HARVEST], mediumBody, ['builder'], {
			DEPOSIT: {
				forceIfNotEmpty: true,
				returnHomeFirst: true
			}
		});
	}

	//fallback to harvesters
	if (!population.harvester || population.harvester - population.kickstartHarvester < 20) {
		return spawnCreep(spawn, 'harvester', [CRY, DEPOSIT, HARVEST], mediumBody, ['harvester'], {
			DEPOSIT: {
				forceIfNotEmpty: true,
				returnHomeFirst: true
			}
		});
	}

	//fallback to stage 2 for combat types
	return stage2(spawn, creeps, population);
}

function stage4(spawn, creeps, population) {
	creeps = creeps || getCreepsByOrigin(spawn);
	population = population || getPopulationByTags(creeps);

	//check for 'claimme' flag
	if (Game.flags['claimme']) {
		let population = getPopulationByTags(getCreepsByOrigin(null));

		//spawn medium colonists
		if (!population.colonist || population.colonist < 10) {
			return spawnCreep(spawn, 'colonist', [CRY, REPAIR, BUILD, HARVEST, TARGET, DEPOSIT], mediumBody, ['colonist'], {
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

		//spawn 1 claimer
		if (!population.claimer) {
			return spawnCreep(spawn, 'claimer', [TARGET, CLAIMER], claimerBody, ['claimer'], {
				TARGET: {
					targetFlag: 'claimme',
					stopInRoom: true
				}
			});
		}
	}

	//spawn medium harvesters
	if (!population.harvester || population.harvester - population.kickstartHarvester < 5) {
		return spawnCreep(spawn, 'harvester', [CRY, DEPOSIT, HARVEST], mediumBody, ['harvester'], {
			DEPOSIT: {
				forceIfNotEmpty: true,
				returnHomeFirst: true
			}
		});
	}

	//spawn medium restockers
	const totalSpareEnergy = getStores(spawn, [CONTAINER, STORAGE])
		.reduce((total, store) => store.store[RESOURCE_ENERGY], 0)
	;

	if ((!population.restocker || population.restocker < 2) && totalSpareEnergy >= 2000) {
		return spawnCreep(spawn, 'restocker', [CRY, DEPOSIT, WITHDRAW], mediumLorryBody, ['restocker'], {
			DEPOSIT: {
				forceIfNotEmpty: true,
				returnHomeFirst: true,
				stores: [TOWER, SPAWN, EXTENSION]
			},
			WITHDRAW: {
				skipOwnRoom: false,
				stores: [TOMBSTONE, CONTAINER, STORAGE]
			}
		});
	}

	//spawn large upgraders
	if (!population.upgrader || population.upgrader - population.kickstartUpgrader < 2) {
		return spawnCreep(spawn, 'upgrader', [CRY, HARVEST, UPGRADE], largeBody, ['upgrader']);
	}

	//spawn large builders
	if (!population.builder || population.builder < 5) {
		return spawnCreep(spawn, 'builder', [CRY, REPAIR, BUILD, DEPOSIT, HARVEST], largeBody, ['builder'], {
			DEPOSIT: {
				forceIfNotEmpty: true,
				returnHomeFirst: true
			}
		});
	}

	//spawn large scouts
	if (!population.scout || population.scout < 5) {
		return spawnCreep(spawn, 'scout', [BRAVE, CARE, TARGET, PATROL], largeFightBody, ['scout', 'combat'], {
			TARGET: {
				targetFlag: 'rallypoint',
				override: true
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

	//spawn medium scavengers
	if (!population.scavenger) {
		return spawnCreep(spawn, 'scavenger', [CRY, TARGET, PICKUP, WITHDRAW, DEPOSIT], mediumLorryBody, ['scavenger'], {
			TARGET: {
				targetFlag: 'collectionpoint',
				override: true
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

	//fallback to large harvesters
	if (!population.harvester || population.harvester - population.kickstartHarvester < 10) {
		return spawnCreep(spawn, 'harvester', [CRY, DEPOSIT, HARVEST], largeBody, ['harvester'], {
			DEPOSIT: {
				forceIfNotEmpty: true,
				returnHomeFirst: true
			}
		});
	}

	//no fall through this time
	return null;
}

function stage5(spawn, creeps, population) {
	creeps = creeps || getCreepsByOrigin(spawn);
	population = population || getPopulationByTags(creeps);

	//check for 'claimme' flag
	if (Game.flags['claimme']) {
		let population = getPopulationByTags(getCreepsByOrigin(null));

		//spawn medium colonists
		if (!population.colonist || population.colonist < 10) {
			return spawnCreep(spawn, 'colonist', [CRY, REPAIR, BUILD, HARVEST, TARGET, DEPOSIT], mediumBody, ['colonist'], {
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

		//spawn 1 claimer
		if (!population.claimer) {
			return spawnCreep(spawn, 'claimer', [TARGET, CLAIMER], claimerBody, ['claimer'], {
				TARGET: {
					targetFlag: 'claimme',
					stopInRoom: true
				}
			});
		}
	}

	//spawn medium harvesters
	if (!population.harvester || population.harvester - population.kickstartHarvester < 2) {
		return spawnCreep(spawn, 'harvester', [CRY, DEPOSIT, HARVEST], mediumBody, ['harvester'], {
			DEPOSIT: {
				forceIfNotEmpty: true,
				returnHomeFirst: true
			}
		});
	}

	//spawn large harvesters
	if (!population.harvester || population.harvester - population.kickstartHarvester < 5) {
		return spawnCreep(spawn, 'harvester', [CRY, DEPOSIT, HARVEST], largeBody, ['harvester'], {
			DEPOSIT: {
				forceIfNotEmpty: true,
				returnHomeFirst: true
			}
		});
	}

	//spawn medium restockers
	const totalSpareEnergy = getStores(spawn, [CONTAINER, STORAGE])
		.reduce((total, store) => store.store[RESOURCE_ENERGY], 0)
	;

	if ((!population.restocker || population.restocker < 2) && totalSpareEnergy >= 10000) {
		return spawnCreep(spawn, 'restocker', [CRY, DEPOSIT, WITHDRAW], mediumLorryBody, ['restocker'], {
			DEPOSIT: {
				forceIfNotEmpty: true,
				returnHomeFirst: true,
				stores: [TOWER, SPAWN, EXTENSION]
			},
			WITHDRAW: {
				skipOwnRoom: false,
				stores: [TOMBSTONE, CONTAINER, STORAGE]
			}
		});
	}

	//spawn huge upgraders
	if (!population.upgrader || population.upgrader - population.kickstartUpgrader < 2) {
		return spawnCreep(spawn, 'upgrader', [CRY, HARVEST, UPGRADE], hugeBody, ['upgrader']);
	}

	//spawn huge builders
	if (!population.builder || population.builder < 5) {
		return spawnCreep(spawn, 'builder', [CRY, REPAIR, BUILD, DEPOSIT, HARVEST], hugeBody, ['builder'], {
			DEPOSIT: {
				forceIfNotEmpty: true,
				returnHomeFirst: true
			}
		});
	}

	//spawn large scouts
	if (!population.scout || population.scout < 5) {
		return spawnCreep(spawn, 'scout', [BRAVE, CARE, TARGET, PATROL], largeFightBody, ['scout', 'combat'], {
			TARGET: {
				targetFlag: 'rallypoint',
				override: true
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

	//spawn medium scavengers
	if (!population.scavenger) {
		return spawnCreep(spawn, 'scavenger', [CRY, TARGET, PICKUP, WITHDRAW, DEPOSIT], mediumLorryBody, ['scavenger'], {
			TARGET: {
				targetFlag: 'collectionpoint',
				stopInRoom: true,
				override: true
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

	//fallback to huge harvesters
	if (!population.harvester || population.harvester - population.kickstartHarvester < 10) {
		return spawnCreep(spawn, 'harvester', [CRY, DEPOSIT, HARVEST], hugeBody, ['harvester'], {
			DEPOSIT: {
				forceIfNotEmpty: true,
				returnHomeFirst: true
			}
		});
	}

	//no fall through this time
	return null;
}

function stage6(spawn, creeps, population) {
	//
}

function stage7(spawn, creeps, population) {
	//
}

function stage8(spawn, creeps, population) {
	//
}

function handleSpawn(spawn) {
//console.log(JSON.stringify(getPopulationByTags(getCreepsByOrigin(spawn))));

	//build spawn
	autoBuild(spawn, 'basic');

	if (spawn.room.controller.level >= 4 && !Game.time % 10 == 0) {
		placeConstructionSites(spawn, require('schematic.basicramparts'));
	}

	//defend the spawn!
	defendSpawn(spawn);

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

	//stages 6, 7 & 8 are not yet implemented

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
