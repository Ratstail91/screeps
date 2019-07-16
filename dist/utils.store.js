const TOWER = 'TOWER';
const SPAWN = 'SPAWN';
const EXTENSION = 'EXTENSION';
const CONTAINER = 'CONTAINER';
const STORAGE = 'STORAGE';
const TERMINAL = 'TERMINAL';
const TOMBSTONE = 'TOMBSTONE';

function getStores(point, types) {
	let result = [];

	if (!types) {
		types = [TOWER, SPAWN, EXTENSION, CONTAINER, STORAGE];
	}

	types.forEach(type => {
		switch(type) {
			case TOWER:
				result = result.concat(point.room.find(FIND_STRUCTURES, { filter: structure =>
					structure.structureType == STRUCTURE_TOWER && structure.my
				}));
				break;

			case SPAWN:
				result = result.concat(point.room.find(FIND_STRUCTURES, { filter: structure =>
					structure.structureType == STRUCTURE_SPAWN && structure.my
				}));
				break;

			case EXTENSION:
				result = result.concat(point.room.find(FIND_STRUCTURES, { filter: structure =>
					structure.structureType == STRUCTURE_EXTENSION && structure.my
				}));
				break;

			case CONTAINER:
				result = result.concat(point.room.find(FIND_STRUCTURES, { filter: structure =>
					structure.structureType == STRUCTURE_CONTAINER
				}));
				break;

			case STORAGE:
				result = result.concat(point.room.find(FIND_STRUCTURES, { filter: structure =>
					structure.structureType == STRUCTURE_STORAGE
				}));
				break;

			case TERMINAL:
				result = result.concat(point.room.find(FIND_STRUCTURES, {filter: structure =>
					structure.structureType == STRUCTURE_TERMINAL
				}));
				break;

			case TOMBSTONE:
				result = result.concat(point.room.find(FIND_TOMBSTONES));
				break;
		}
	});

	return result;
}

function checkIsStoreEmpty(store) {
	//check tombstones
	if (store.deathTime) {
		return _.sum(store.store) == 0;
	}

	switch(store.structureType) {
		case STRUCTURE_TOWER:
		case STRUCTURE_SPAWN:
		case STRUCTURE_EXTENSION:
			return store.energy == 0;

		case STRUCTURE_CONTAINER:
		case STRUCTURE_STORAGE:
		case STRUCTURE_TERMINAL:
			return _.sum(store.store) == 0;

		default:
			throw new Error(`Unknown store.structureType ${store.structureType}`);
	}
}

function checkIsStoreFull(store) {
	//check tombstones
	if (store.deathTime) {
		return _.sum(store.store) != 0;
	}

	switch(store.structureType) {
		case STRUCTURE_TOWER:
		case STRUCTURE_SPAWN:
		case STRUCTURE_EXTENSION:
			return store.energy == store.energyCapacity;

		case STRUCTURE_CONTAINER:
		case STRUCTURE_STORAGE:
		case STRUCTURE_TERMINAL:
			return _.sum(store.store) == store.storeCapacity;

		default:
			throw new Error(`Unknown store.structureType ${store.structureType}`);
	}
}

module.exports = {
	TOWER: TOWER,
	SPAWN: SPAWN,
	EXTENSION: EXTENSION,
	CONTAINER: CONTAINER,
	STORAGE: STORAGE,
	TERMINAL: TERMINAL,
	TOMBSTONE: TOMBSTONE,

	getStores: getStores,
	checkIsStoreEmpty: checkIsStoreEmpty,
	checkIsStoreFull: checkIsStoreFull
};
