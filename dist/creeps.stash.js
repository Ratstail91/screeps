const think = creep => {
	//init
	if (!creep.memory.stash) {
		creep.memory.stash = {};
	}

	//find the closest extension
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
}

const act = creep => {
	if (creep.memory.stash.targetId) {
		const target = Game.getObjectById(creep.memory.stash.targetId);

		if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
			creep.moveTo(target);
		}

		return false;
	}

	return true;
}

module.exports = {
	think,
	act,
};
