const { pushTask } = require('tasks');

const runDirectorAI = deadTasks => {
	//initialize the memory object
	Memory.director = Memory.director || {
		sources: [],
		markedConstructionSites: []
	};

	Memory.tasks = Memory.tasks || [];
	Memory.rooms = Memory.rooms || {};

	//scan the rooms for their map data
	for (const roomName in Game.rooms) {
		if (!Memory.rooms[roomName]) {
			//store in the room memory
			Memory.rooms[roomName] = {
				sources: Game.rooms[roomName].find(FIND_SOURCES)
			};
		}

		const my = (Game.rooms[roomName].controller && Game.rooms[roomName].controller.my) || Game.rooms[roomName].find(FIND_FLAGS).some(f => f.room.name.startsWith('remote')); //TODO: test remote flags

		if (my && !Memory.rooms[roomName].my) {
			console.log('remembering room ' + roomName); //TODO: remove this

			Memory.rooms[roomName].my = my;

			Memory.director.sources = Memory.director.sources.concat(Memory.rooms[roomName].sources);

			//dispatch harvesting tasks
			Memory.rooms[roomName].sources.forEach(s => pushTask('HARVEST', { target: s }));

			if (Game.rooms[roomName].controller && Game.rooms[roomName].controller.my) {
				pushTask('UPGRADE', { target: Game.rooms[roomName].controller });
			}
		}

		//TODO: forget rooms
	}

	//dispatch construction tasks
	Object.values(Game.constructionSites).forEach(site => {
		if (Memory.director.markedConstructionSites.filter(ms => ms.id === site.id).length === 0) {
			Memory.director.markedConstructionSites.push(site);
			pushTask('BUILD', { target: site });
		}
	});

	//cache population
	const population = {};

	//count the existing creeps
	Object.values(Game.creeps).forEach(c => population[c.memory.type] = population[c.memory.type] + 1 || 1);

	//count the dispatched tasks
	Memory.tasks.forEach(t => population[t.creepType] = t.type == 'SPAWN' ? population[t.creepType] + 1 || 1 : population[t.creepType] );

	//dispatch more creeps if needed
	if (!population.harvester || population.harvester < 2) {
		pushTask('SPAWN', { creepType: 'harvester' });
	}

	if (!population.builder || population.builder < 1) {
		pushTask('SPAWN', { creepType: 'builder' });
	}

	if (!population.upgrader || population.upgrader < 1) {
		pushTask('SPAWN', { creepType: 'upgrader' });
	}

	//refresh dead creep tasks
	for (const task in deadTasks) {
		console.log('refreshing task');
		pushTask(task.type, task);
	}
};

module.exports = {
	runDirectorAI,
};