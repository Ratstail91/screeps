const spawnAI = require('spawn-ai');

module.exports.loop = () => {
	//let each spawn think about it's imperatives
	for (const name in Game.spawns) {
		spawnAI.think(Game.spawns[name]);
	}

	//process the spawn based on it's imperatives
	for (const name in Game.spawns) {
		spawnAI.act(Game.spawns[name]);
	}

	//process the creeps based on their given instructions
	nextCreep:
	for (const name in Game.creeps) {
		//get this creep
		const creep = Game.creeps[name];

		//don't confuse the instruction sets
		if (creep.spawning) {
			continue nextCreep;
		}

		for (const index in creep.memory.instructions) {
			const fileName = `creeps.${creep.memory.instructions[index].toLowerCase()}`;

			//if the creep is busy, move on to the next one
			if (!require(fileName).think(creep)) {
				continue nextCreep;
			}
		}

		nextInstruction:
		for (const index in creep.memory.instructions) {
			const fileName = `creeps.${creep.memory.instructions[index].toLowerCase()}`;

			if (!require(fileName).act(creep)) {
				break nextInstruction;
			}
		}
	}

	//delete memory of dead creeps
	for(const name in Memory.creeps) {
		if(!Game.creeps[name]) {
			delete Memory.creeps[name];
		}
	}
};
