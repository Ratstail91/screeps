//storage types that this file recognizes
//TODO: replace some of these with the game's STRUCTURE_* constants
const TOWER = "TOWER";
const SPAWN = "SPAWN";
const EXTENSION = "EXTENSION";
const CONTAINER = "CONTAINER";
const STORAGE = "STORAGE";
const TERMINAL = "TERMINAL";
const TOMBSTONE = "TOMBSTONE";
const RUINS = "RUINS";

/* DOCS: getStores(creep | spawn [, types])
 * "point" can be anything with both "room" and "pos" members, including flags.
 * "types" is an optional array of store types
*/
function getStores(point, types) {
	let result = [];

	//default types
	if (!types) {
		types = [TOWER, EXTENSION, SPAWN, CONTAINER, STORAGE];
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

			case RUINS:
				result = result.concat(point.room.find(FIND_RUINS)
					.sort((a, b) => rangeCache[a.id] - rangeCache[b.id])
				);
		}
	});

	return result;
}

module.exports = {
	TOWER,
	SPAWN,
	EXTENSION,
	CONTAINER,
	STORAGE,
	TERMINAL,
	TOMBSTONE,
	RUINS,

	getStores,
};
