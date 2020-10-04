const roomAI = require('room-ai');

module.exports.loop = () => {
	//setup some custom references for the API to utilize
	Game.live = {};
	Game.live.myRooms = _.filter(Game.rooms, r => r.controller && r.controller.level > 0 && r.controller.my);

	//process my rooms
	for (const name in Game.live.myRooms) {
		roomAI.think(Game.live.myRooms[name]);
	}

	//process my rooms
	for (const name in Game.live.myRooms) {
		roomAI.act(Game.live.myRooms[name]);
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
