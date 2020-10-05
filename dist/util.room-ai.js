//utilities
const requestNewSourceId = room => {
	return Game.live[room.name].sources[++room.memory.sourceCounter % Game.live[room.name].sources.length].id
};

module.exports = {
	requestNewSourceId
};