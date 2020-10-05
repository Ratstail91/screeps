/* DOCS: Sit is used exclusively by static harvesters
*/

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

		let blocked = _.filter(dest.look(), obj => obj.type == 'creep').length > 0;

		const move = creep.moveTo(dest);

		if (move == ERR_NO_PATH || blocked) {
			//request a new source & perch
			creep.memory.harvest.targetId = requestNewSourceId(creep.room);

			const room = Game.getObjectById(creep.memory.homeId);

			const perch = _.filter(room.memory.perches.sources, perch => perch.id == creep.memory.harvest.targetId)[0];

			creep.memory.sit.x = perch.x;
			creep.memory.sit.y = perch.y;
			creep.memory.sit.roomName = room.name;
		}

		return false;
	}

	return true;
};

module.exports = {
	think,
	act,
};
