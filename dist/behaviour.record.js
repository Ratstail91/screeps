/* DOCS: record behaviour
 * This behaviour records the room's details into memory, essentially building an internal map.
 * 
 * The format for room data is:
 * 
 * 'roomName': {
 	name: 'roomName',
	sources: number,
	minerals: [],
	exits: {
		//undefined = no door, null = not explored
		north: undefined | null | 'roomName',
		south: undefined | null | 'roomName',
		east: undefined | null | 'roomName',
		west: undefined | null | 'roomName',
	},
 }
*/

function init(creep) {
	//initialize the map object
	if (!Memory.map) {
		Memory.map = {
			rooms: {}
		};
	}
}

function run(creep) {
	if (!Memory.map.rooms[creep.room.name]) {
		Memory.map.rooms[creep.room.name] = createRoomRecord(creep, creep.room);
	}

	return true;
}

function createRoomRecord(creep, room) {
	return {
		name: room.name, //for debugging
		sources: room.find(FIND_SOURCES).length,
		minerals: room.find(FIND_MINERALS).map(m => m.mineralType),
		distance: Game.map.getRoomLinearDistance(room.name, Game.spawns[creep.memory.origin].room.name, true),
		exits: {
			//undefined = no door, null = not explored
			north: room.find(FIND_EXIT_TOP).length > 0 ? null : undefined,
			south: room.find(FIND_EXIT_BOTTOM).length > 0 ? null : undefined,
			east: room.find(FIND_EXIT_RIGHT).length > 0 ? null : undefined,
			west: room.find(FIND_EXIT_LEFT).length > 0 ? null : undefined,
		}
	}
}

module.exports = {
	init,
	run,
};
