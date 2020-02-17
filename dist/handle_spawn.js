const { getMatchingTask, pushTask } = require('tasks');

const handleSpawn = spawn => {
	//busy
	if (spawn.spawning) {
		return 0;
	}

	const task = getMatchingTask('SPAWN', { room: spawn.room, assigned: spawn });

	if (!task) {
		return 0;
	}

	switch(task.creepType) {
		case 'harvester':
		case 'builder':
		case 'upgrader':
			return spawnWorker(spawn, task);

		default:
			throw "Unknown creepType: " + task.creepType;
	}
};

const spawnWorker = (spawn, task) => {
	//can't do this yet
	if (spawn.room.energyAvailable < 300) {
		return 1;
	}

	if (spawn.room.energyCapacityAvailable >= 600) {
		//spawn big
		const body = [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE];
		return spawn.spawnCreep(body, task.creepType + Game.time, { memory: { type: task.creepType } });
	} else {
		//spawn small
		const body = [WORK, WORK, CARRY, MOVE];
		return spawn.spawnCreep(body, task.creepType + Game.time, { memory: { type: task.creepType } });
	}
}

module.exports = {
	handleSpawn,
};
