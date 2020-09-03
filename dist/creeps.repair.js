const think = creep => {
	//init
	if (!creep.memory.repair) {
		creep.memory.repair = {};
	}
	
	if (creep.memory.repair.locked) {
		if (!act(creep)) {
			return false; //short-circuit
		}
		
		creep.memory.repair.locked = false;
	}

	//find a repair target
	const target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
		filter: s => s.hits < s.hitsMax
	});
	
	if (target) {
		creep.memory.repair.targetId = target.id;
	} else {
		//no targets found
		creep.memory.repair.targetId = null;
	}
	
	return true;
}

const act = creep => {
	if (creep.memory.repair.targetId) {
		const target = Game.getObjectById(creep.memory.repair.targetId);
		
		if (creep.repair(target) == ERR_NOT_IN_RANGE) {
			creep.moveTo(target);
			return false;
		}
		
		creep.memory.target.locked = true;
		
		if (creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
			creep.memory.target.targetId = null;
		}
		
		return false;
	}
	
	return true;
}

module.exports = {
	think,
	act,
};
