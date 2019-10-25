/* DOCS: build behaviour
 * This behaviour makes creeps build on my existing construction sites in the same room.
 * This behaviour interacts with TOP.
 * Note that ramparts and walls are given a lower priority.
*/
const { BUILD: BEHAVIOUR_NAME } = require('behaviour_names');

const { REUSE_PATH } = require('constants');

const pathStyle = { stroke: '#ff00ff' };

/* DOCS: init(creep)
 * Initialize build behaviour for "creep".
*/
function init(creep) {
	creep.memory[BEHAVIOUR_NAME] = _.merge({
		structures: null, //only build these structure types
		_lock: false
	}, creep.memory[BEHAVIOUR_NAME]);
}

/* DOCS: run(creep)
 * Run build behaviour for "creep".
*/
function run(creep) {
	//can't build on an empty stomach
	if (creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
		return true;
	}

	//don't stand on the doorway!
	if (creep.pos.x <= 0 || creep.pos.y <= 0 || creep.pos.x >= 49 || creep.pos.y >= 49) {
		return true;
	}

	//NOTE: building ramparts and walls with the lowest priority
	let allConstructionSites = creep.room.find(FIND_CONSTRUCTION_SITES, { filter: site => site.structureType != STRUCTURE_RAMPART && site.structureType != STRUCTURE_WALL && (!creep.memory[BEHAVIOUR_NAME].structures || creep.memory[BEHAVIOUR_NAME].structures.indexOf(site.structureType) != -1) });

	if (allConstructionSites.length == 0) {
		allConstructionSites = creep.room.find(FIND_CONSTRUCTION_SITES, { filter: site => !creep.memory[BEHAVIOUR_NAME].structures || creep.memory[BEHAVIOUR_NAME].structures.indexOf(site.structureType) != -1 });
	}

	let constructionSite = creep.pos.findClosestByRange(allConstructionSites);

	//no construction sites found
	if (!constructionSite) {
		return true;
	}

	const buildResult = creep.build(constructionSite);

	switch(buildResult) {
		case OK:
			//everything is OK, send a '_lock' message to TOP
			creep.memory[BEHAVIOUR_NAME]._lock = true;
			return false;

		case ERR_NOT_IN_RANGE:
			creep.moveTo(constructionSite, { reusePath: REUSE_PATH, visualizePathStyle: pathStyle, range: 3 });
			return false;

		default:
			throw new Error(`Unknown state in ${BEHAVIOUR_NAME} for ${creep.name}: buildResult ${buildResult}`);
	}
}

const profiler = require('screepers.profiler');

module.exports = {
	init: profiler.registerFN(init, "build.init"),
	run: profiler.registerFN(run, "build.run"),
};
