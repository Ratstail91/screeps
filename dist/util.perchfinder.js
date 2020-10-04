const findPerchesInRoom = room => {
	//init memory
	room.memory.perches = room.memory.perches || {};

	//find source perches
	let sourcePerches = [];

	Game.live[room.name].sources.forEach(source => {
		//look around this source
		outer:
		for (let i = -1; i <= 1; i++) {
			for (let j = -1; j <= 1; j++) {
				const at = room.lookAt(source.pos.x + i, source.pos.y + j);

				//check for walls
				const hasWall = at.some(entry => entry.type == 'terrain' && entry.terrain == 'wall');

				//if this is not a wall, it's good enough for a perch
				if (!hasWall) {
					sourcePerches.push({ x: source.pos.x + i, y: source.pos.y + j, id: source.id });
					break outer;
				}
			}
		}
	});

	//save the perches
	room.memory.perches.sources = sourcePerches;
};

const setupPerchesInRoom = room => {
	room.memory.perches.sources.forEach(perch => room.createConstructionSite(perch.x, perch.y, STRUCTURE_CONTAINER));
};

module.exports = {
	findPerchesInRoom,
	setupPerchesInRoom,
};