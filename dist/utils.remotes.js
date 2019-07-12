function countRemotes(spawnName) {
	let counter = 0;

	while(true) {
		if (!Game.flags[`${spawnName}remote${counter}`]) {
			return counter;
		}

		counter++;
	}
}

module.exports = {
	countRemotes: countRemotes
};