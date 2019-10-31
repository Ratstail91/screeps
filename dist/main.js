const { handleSpawn } = require('spawns');
const { handleCreep } = require('creeps');
const handleTelephone = require('telephone.handler');
const profiler = require('screepers.profiler');

function handleError(e) {
	console.log(`<div style="color:pink">${e.stack || e}</div>`);
	Game.notify(`<div style="background-color:pink">${e.stack || e}</div>`);
}

profiler.enable();
module.exports.loop = () => {
	profiler.wrap(() => {
		//TODO: kill creeps with no memory

		//check the telephone
		try {
			handleTelephone();
		} catch(e) {
			handleError(e);
		}

		//run the spawn AI
		for (const spawnName in Game.spawns) {
			try {
				handleSpawn(Game.spawns[spawnName]);
			} catch(e) {
				handleError(e);
			}
		}

		//run the creep AI
		for (const creepName in Game.creeps) {
			try {
				handleCreep(Game.creeps[creepName]);
			} catch(e) {
				handleError(e);
			}
		}

		//delete memory of dead creeps
		for(const name in Memory.creeps) {
			if(!Game.creeps[name]) {
				delete Memory.creeps[name];
			}
		}
	});
};
