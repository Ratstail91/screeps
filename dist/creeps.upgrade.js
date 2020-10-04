const think = creep => {
	//init memory
	if (!creep.memory.upgrade) {
		creep.memory.upgrade = {};
	}

	//process locking
	if (creep.memory.upgrade.locked) {
		if (!act(creep)) {
			return false; //short-circuit
		}

		creep.memory.upgrade.locked = false;
	}

	return true;
};

const act = creep => {
	//TODO: handle controllers when working remotely
	if (creep.room.controller.my && creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
		//dump into the controller
		const result = creep.upgradeController(creep.room.controller);

		if (result == ERR_NOT_IN_RANGE) {
			creep.moveTo(creep.room.controller);
			return false;
		}

		//lock into this action
		creep.memory.upgrade.locked = true;

		return false;
	}

	return true;
};

module.exports = {
	think,
	act,
};
