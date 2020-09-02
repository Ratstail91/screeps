const think = creep => {
	//DO NOTHING
	return true;
}

const act = creep => {
	//go home
	if (!creep.room.controller.my) {
		const spawn = Game.getObjectById(creep.memory.spawnId);
		
		creep.moveTo(spawn);
		
		return false;
	} else {
		//dump into the controller
		if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
			creep.moveTo(creep.room.controller);
		}
		
		return false;
	}
}

module.exports = {
	think,
	act,
};
