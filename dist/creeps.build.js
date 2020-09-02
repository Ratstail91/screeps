const think = creep => {
	//init
	if (!creep.memory.stash) {
		creep.memory.build = {};
	}

	//find a construction site
	const site = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
	
	if (site) {
		creep.memory.build.targetId = site.id;
	} else {
		//no sites found
		creep.memory.build.targetId = null;
	}
	
	return true;
}

const act = creep => {
	if (creep.memory.build.targetId) {
		const target = Game.getObjectById(creep.memory.build.targetId);
		
		if (creep.build(target) == ERR_NOT_IN_RANGE) {
			creep.moveto(target);
		}
		
		creep.memory.stash.targetId = null;

		return false;
	}
	
	return true;
}

module.exports = {
	think,
	act,
};
