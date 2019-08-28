const { handleSpawn } = require("spawns");
const { handleCreep } = require("creeps");

const profiler = require("screepers.profiler");

function handleError(e) {
	const msg = `<div style="color:pink">${e.stack || e}</div>`;
	console.log(msg);
	Game.notify(msg);
}

profiler.enable();
module.exports.loop = () => {
	profiler.wrap(() => {
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
