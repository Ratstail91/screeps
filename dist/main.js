const { runDirectorAI } = require('director_ai');
const { handleSpawn } = require('handle_spawn');
const { handleCreep } = require('handle_creep');

function handleError(e) {
	console.log(`<div style="color:pink">${e.stack || e}</div>`);
	Game.notify(`<div style="background-color:pink">${e.stack || e}</div>`);
}

module.exports.loop = () => {
	//delete memory of dead creeps, caching their tasks
	const deadTasks = [];
	for(const name in Memory.creeps) {
		if(!Game.creeps[name]) {
			deadTasks.push(Memory.creeps[name].task);
			delete Memory.creeps[name];
		}
	}

	//run the director
	runDirectorAI(deadTasks);

	//run the spawn AI
	for (const spawnName in Game.spawns) {
		try {
			const res = handleSpawn(Game.spawns[spawnName]);
			console.log('spawn', res);
		} catch(e) {
			handleError(e);
		}
	}

	//run the creep AI
	for (const creepName in Game.creeps) {
		try {
			const res = handleCreep(Game.creeps[creepName]);
			console.log('creep', res);
		} catch(e) {
			handleError(e);
		}
	}
};