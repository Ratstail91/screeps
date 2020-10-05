const think = creep => {
	//init memory
	if (!creep.memory.grab) {
		creep.memory.grab = {};
	}

	//TODO: handle remote when grabbing?
	const targets = creep.room.find(FIND_STRUCTURES, {
		filter: s => s.structureType == STRUCTURE_CONTAINER && s.store.getUsedCapacity(RESOURCE_ENERGY) > 0
	});

	if (targets.length > 0) {
		creep.memory.grab.targetId = targets[0].id;
	} else {
		creep.memory.grab.targetId = null;
	}

	return true;
};

const act = creep => {
	if (creep.memory.grab.targetId && creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
		const target = Game.getObjectById(creep.memory.grab.targetId);

		const result = creep.withdraw(target, RESOURCE_ENERGY);

		if (result == ERR_NOT_IN_RANGE) {
			creep.moveTo(target);
		}

		//can't withdraw from this target now
		if (result == ERR_NOT_ENOUGH_RESOURCES) {
			return true;
		}

		return false;
	}

	return true;
};

module.exports = {
	think,
	act,
};
