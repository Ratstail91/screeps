//storage types that this file recognizes
const TOWER = "TOWER";
const SPAWN = "SPAWN";
const EXTENSION = "EXTENSION";
const CONTAINER = "CONTAINER";
const STORAGE = "STORAGE";
const TERMINAL = "TERMINAL";
const TOMBSTONE = "TOMBSTONE";

/* DOCS: getStores(creep | spawn [, types])
 * "point" can be anything with both "room" and "pos" members, including flags.
 * "types" is an optional array of store types
*/
function getStores(point, types) {
	let result = [];

	//default types
	if (!types) {
		types = [TOWER, SPAWN, EXTENSION, CONTAINER, STORAGE];
	}

	//cache to reduce CPU usage of getRangeTo()
	let rangeCache = [];
	point.room.find(FIND_STRUCTURES).forEach(s => rangeCache[s.id] = point.pos.getRangeTo(s));

	//iterate over the switch
	types.forEach(type => {
		switch(type) {
			case TOWER:
				result = result.concat(point.room.find(FIND_STRUCTURES, { filter: structure =>
					structure.structureType == STRUCTURE_TOWER && structure.my
				}).sort((a, b) =>
					rangeCache[a.id] - rangeCache[b.id]
				));
				break;

			case SPAWN:
				result = result.concat(point.room.find(FIND_STRUCTURES, { filter: structure =>
					structure.structureType == STRUCTURE_SPAWN && structure.my
				}).sort((a, b) =>
					rangeCache[a.id] - rangeCache[b.id]
				));
				break;

			case EXTENSION:
				result = result.concat(point.room.find(FIND_STRUCTURES, { filter: structure =>
					structure.structureType == STRUCTURE_EXTENSION && structure.my
				}).sort((a, b) =>
					rangeCache[a.id] - rangeCache[b.id]
				));
				break;

			case CONTAINER:
				result = result.concat(point.room.find(FIND_STRUCTURES, { filter: structure =>
					structure.structureType == STRUCTURE_CONTAINER
				}).sort((a, b) =>
					rangeCache[a.id] - rangeCache[b.id]
				));
				break;

			case STORAGE:
				result = result.concat(point.room.find(FIND_STRUCTURES, { filter: structure =>
					structure.structureType == STRUCTURE_STORAGE
				}).sort((a, b) =>
					rangeCache[a.id] - rangeCache[b.id]
				));
				break;

			case TERMINAL:
				result = result.concat(point.room.find(FIND_STRUCTURES, {filter: structure =>
					structure.structureType == STRUCTURE_TERMINAL && structure.my
				}).sort((a, b) =>
					rangeCache[a.id] - rangeCache[b.id]
				));
				break;

			case TOMBSTONE:
				result = result.concat(point.room.find(FIND_TOMBSTONES)
					.sort((a, b) => rangeCache[a.id] - rangeCache[b.id])
				);
				break;
		}
	});

	return result;
}

/* DOCS: checkIsStoreEmpty(store)
 * "store" is the store to check
*/
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

/* DOCS: checkIsStoreFull(store)
 * "store" is the store to check
*/
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
	TOWER,
	SPAWN,
	EXTENSION,
	CONTAINER,
	STORAGE,
	TERMINAL,
	TOMBSTONE,

	getStores,
	checkIsStoreEmpty,
	checkIsStoreFull,
};
