const think = creep => {
	//init memory
	if (!creep.memory.stash) {
		creep.memory.stash = {};
	}

	//TODO: stash in more locations

	//find the closest extension
	//TODO: handle extensions when working remotely
	const extension = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
		filter: s => s.structureType == STRUCTURE_EXTENSION && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
	});

	if (extension) {
		creep.memory.stash.targetId = extension.id;
	} else {
		//no extension, stash at home
		creep.memory.stash.targetId = creep.memory.spawnId;
	}

	return true;
};

const act = creep => {
	//assume stash.targetId is set elsewhere
	if (creep.memory.stash.targetId) {
		const target = Game.getObjectById(creep.memory.stash.targetId);

		if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
			creep.moveTo(target);
		}

		return false;
	}

	return true;
};

module.exports = {
	think,
	act,
};
