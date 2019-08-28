const { handleSpawn } = require("spawns");
const { handleCreep } = require("creeps");

function handleError(e) {
	const msg = `<div style="color:pink">${e.stack}</div>`;
	console.log(msg);
	Game.notify(msg);
}

module.exports.loop = () => {
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
};
