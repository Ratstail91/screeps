const _ = require('lodash');

const TOWER = 'TOWER';
const SPAWN = 'SPAWN';
const EXTENSION = 'EXTENSION';
const CONTAINER = 'CONTAINER';
const STORAGE = 'STORAGE';

function getStores(creep, types = [TOWER, SPAWN, EXTENSION, CONTAINER, STORAGE]) {
	let result = [];

	types.forEach(type => {
		switch(type) {
			case TOWER:
				result = result.concat(creep.room.find(FIND_STRUCTURES, { filter: structure =>
					structure.structureType == STRUCTURE_TOWER && structure.energy < structure.energyCapacity && structure.my
				}));
				break;

			case SPAWN:
				result = result.concat(creep.room.find(FIND_STRUCTURES, { filter: structure =>
					structure.structureType == STRUCTURE_SPAWN && structure.energy < structure.energyCapacity && structure.my
				}));
				break;

			case EXTENSION:
				result = result.concat(creep.room.find(FIND_STRUCTURES, { filter: structure =>
					structure.structureType == STRUCTURE_EXTENSION && structure.energy < structure.energyCapacity && structure.my
				}));
				break;

			case CONTAINER:
				result = result.concat(creep.room.find(FIND_STRUCTURES, { filter: structure =>
					structure.structureType == STRUCTURE_CONTAINER && _.sum(structure.store) < structure.storeCapacity
				}));
				break;

			case STORAGE:
				result = result.concat(creep.room.find(FIND_STRUCTURES, { filter: structure =>
					structure.structureType == STRUCTURE_STORAGE && _.sum(structure.store) < structure.storeCapacity
				}));
				break;
		}
	});

	return result;
}

module.exports = {
	TOWER: TOWER,
	SPAWN: SPAWN,
	EXTENSION: EXTENSION,
	CONTAINER: CONTAINER,
	STORAGE: STORAGE,
	getStores: getStores
};
