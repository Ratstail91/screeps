const _ = require('lodash');

function getStores(creep) {
	const towers = creep.room.find(FIND_STRUCTURES, { filter: structure =>
		structure.structureType == STRUCTURE_TOWER && structure.energy < structure.energyCapacity && structure.my
	});

	const spawns = creep.room.find(FIND_STRUCTURES, { filter: structure =>
		structure.structureType == STRUCTURE_SPAWN && structure.energy < structure.energyCapacity && structure.my
	});

	const extensions = creep.room.find(FIND_STRUCTURES, { filter: structure =>
		structure.structureType == STRUCTURE_EXTENSION && structure.energy < structure.energyCapacity && structure.my
	});

	//NOTE: works for ANY container
	const containers = creep.room.find(FIND_STRUCTURES, { filter: structure =>
		structure.structureType == STRUCTURE_CONTAINER && _.sum(structure.store) < structure.storeCapacity
	});

	//NOTE: works for ANY storage
	const storage = creep.room.find(FIND_STRUCTURES, { filter: structure =>
		structure.structureType == STRUCTURE_STORAGE && _.sum(structure.store) < structure.storeCapacity
	});

	return [...towers, ...spawns, ...extensions, ...containers, ...storage];
}

module.exports = {
	getStores: getStores
};
