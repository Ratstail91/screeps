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
					structure.structureType == STRUCTURE_TOWER && structure.my
				}));
				break;

			case SPAWN:
				result = result.concat(creep.room.find(FIND_STRUCTURES, { filter: structure =>
					structure.structureType == STRUCTURE_SPAWN && structure.my
				}));
				break;

			case EXTENSION:
				result = result.concat(creep.room.find(FIND_STRUCTURES, { filter: structure =>
					structure.structureType == STRUCTURE_EXTENSION && structure.my
				}));
				break;

			case CONTAINER:
				result = result.concat(creep.room.find(FIND_STRUCTURES, { filter: structure =>
					structure.structureType == STRUCTURE_CONTAINER
				}));
				break;

			case STORAGE:
				result = result.concat(creep.room.find(FIND_STRUCTURES, { filter: structure =>
					structure.structureType == STRUCTURE_STORAGE
				}));
				break;
		}
	});

	return result;
}

function checkIsStoreEmpty(store) {
	switch(store.structureType) {
		case STRUCTURE_TOWER:
		case STRUCTURE_SPAWN:
		case STRUCTURE_EXTENSION:
			return store.energy == 0;

		case STRUCTURE_CONTAINER:
		case STRUCTURE_STORAGE:
			return _.sum(store.store) == 0;

		default:
			throw new Error(`Unknown structureType ${structureType}`);
	}
}

function checkIsStoreFull(store) {
	switch(store.structureType) {
		case STRUCTURE_TOWER:
		case STRUCTURE_SPAWN:
		case STRUCTURE_EXTENSION:
			return store.energy == store.energyCapacity;

		case STRUCTURE_CONTAINER:
		case STRUCTURE_STORAGE:
			return _.sum(store.store) == store.storeCapacity;

		default:
			throw new Error(`Unknown structureType ${structureType}`);
	}
}

module.exports = {
	TOWER: TOWER,
	SPAWN: SPAWN,
	EXTENSION: EXTENSION,
	CONTAINER: CONTAINER,
	STORAGE: STORAGE,

	getStores: getStores,
	checkIsStoreEmpty: checkIsStoreEmpty,
	checkIsStoreFull: checkIsStoreFull
};
