/* DOCS: getCreepsByOrigin(spawn)
 * Find all creeps from "spawn".
*/
function getCreepsByOrigin(spawn) {
	const creeps = Object.values(Game.creeps)
		.filter(creep => creep.memory.origin == spawn.name)
	;

	return creeps;
}

/* DOCS: getPopulationByTags([creeps])
 * Count each instance of each tag in the array "creeps".
 * If "creeps" is not provided, it uses Game.creeps.
*/
function getPopulationByTags(creeps = Game.creeps) {
	//known tags
	const population = {};

	//count all arbitrary tags (store them in population, defined above)
	Object.values(creeps)
		.map(creep => creep.memory.tags)
		.forEach(tags => {
			tags.forEach(tag => population[tag] = population[tag] + 1 || 1)
		})
	;

	return population;
}

/* DOCS: countRemotes(spawnName)
 * Counts every remote (flag) that begins with '"spawnName"remote'.
*/
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
	getCreepsByOrigin,
	getPopulationByTags,
	countRemotes,
};