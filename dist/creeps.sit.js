/* DOCS: Sit is used exclusively by static harvesters
*/

const tags = require('constants.tags');

//utilities
const { requestNewSourceId: requestNewSourceId } = require('util.room-ai');

const think = creep => {
	//init memory
	if (!creep.memory.sit) {
		creep.memory.sit = {};
	}

	return true;
};

const act = creep => {
	//assume stash.targetId is set elsewhere
	if (creep.memory.sit.x && creep.memory.sit.y) {
		if (creep.pos.getRangeTo(creep.memory.sit.x, creep.memory.sit.y) == 0) {
			return true;
		}

		const dest = new RoomPosition(creep.memory.sit.x, creep.memory.sit.y, creep.memory.sit.roomName);

		//occupied by a harvester (anything else will move eventually)
		let occupied = _.filter(dest.look(), obj => obj.type == 'creep' && obj.creep.memory.tags.includes(tags.HARVESTER_STATIC)).length > 0;

		const move = creep.moveTo(dest);

		if (move == ERR_NO_PATH || (occupied && creep.pos.getRangeTo(dest) <= 3)) {
			//request a new source & perch
			creep.memory.harvest.targetId = requestNewSourceId(creep.room);

			const homeRoom = Game.rooms[creep.memory.homeName];

			const perch = _.filter(homeRoom.memory.perches.sources, perch => perch.id == creep.memory.harvest.targetId)[0];

			creep.memory.sit.x = perch.x;
			creep.memory.sit.y = perch.y;
			creep.memory.sit.roomName = homeRoom.name;
		}

		return false;
	}

	return true;
};

module.exports = {
	think,
	act,
};
