const think = creep => {
	//init
	if (!creep.memory.upgrade) {
		creep.memory.upgrade = {};
	}

	if (creep.memory.upgrade.locked) {
		if (!act(creep)) {
			return false; //short-circuit
		}

		creep.memory.upgrade.locked = false;
	}

	return true;
}

const act = creep => {
	if (creep.room.controller.my && creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
		//dump into the controller
		if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
			creep.moveTo(creep.room.controller);
			return false;
		}

		creep.memory.upgrade.locked = true;

		return false;
	}

	return true;
}

module.exports = {
	think,
	act,
};
