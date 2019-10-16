const { handleSpawn } = require('spawns');
const { handleCreep } = require('creeps');
const profiler = require('screepers.profiler');

profiler.enable();
module.exports.loop = () => {
	profiler.wrap(() => {
		//TODO: kill creeps with no memory

		//run the spawn AI
		for (const spawnName in Game.spawns) {
			handleSpawn(Game.spawns[spawnName]);
		}

		//run the creep AI
		for (const creepName in Game.creeps) {
			if (Game.creeps[creepName].memory) {
				handleCreep(Game.creeps[creepName]);
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
