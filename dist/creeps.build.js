const think = creep => {
	//init memory
	if (!creep.memory.build) {
		creep.memory.build = {};
	}

	//process locking
	if (creep.memory.build.locked) {
		if (!act(creep)) {
			return false; //short-circuit
		}

		creep.memory.build.locked = false;
	}

	//find a construction site
	const sites = creep.room.find(FIND_MY_CONSTRUCTION_SITES);

	if (sites.length > 0) {
		creep.memory.build.targetId = sites[0].id;
	} else {
		//no sites found
		creep.memory.build.targetId = null;
	}

	return true;
};

const act = creep => {
	if (creep.memory.build.targetId && creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
		const target = Game.getObjectById(creep.memory.build.targetId);

		const result = creep.build(target);

		if (result == ERR_NOT_IN_RANGE) {
			creep.moveTo(target);
			return false;
		}

		//probably finished building
		if (result == ERR_INVALID_TARGET) {
			return true;
		}

		//lock into this action
		creep.memory.build.locked = true;

		return false;
	}

	return true;
};

module.exports = {
	think,
	act,
};
