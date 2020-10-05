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
		if (creep.pos.getRangeTo(creep.memory.sit.x, creep.memory.sit.y)) {
			return true;
		}

		const move = creep.moveTo(creep.memory.sit.x, creep.memory.sit.y);

		if (move == ERR_NO_PATH) {
			//request a new source & perch
			creep.memory.harvest.targetId = requestNewSourceId(creep.room);

			const room = Game.getObjectById(creep.memory.homeId);

			const perch = _.filter(room.memory.perches.sources, perch => perch.id == creep.memory.harvest.targetId)[0];
		}

		return false;
	}

	return true;
};

module.exports = {
	think,
	act,
};
