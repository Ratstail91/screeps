const think = creep => {
	//init memory
	if (!creep.memory.harvest) {
		creep.memory.harvest = {};
	}

	//process locking
	if (creep.memory.harvest.locked) {
		if (!act(creep)) {
			return false; //short-circuit
		}

		creep.memory.harvest.locked = false;
	}

	return true;
};

const act = creep => {
	//assume harvest.targetId is set elsewhere
	if (creep.memory.harvest.targetId && creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
		const target = Game.getObjectById(creep.memory.harvest.targetId);

		if (creep.harvest(target) == ERR_NOT_IN_RANGE) {
			creep.moveTo(target);
			return false;
		}

		//lock into this action
		creep.memory.harvest.locked = true;

		return false;
	}

	return true;
};

module.exports = {
	think,
	act,
};
