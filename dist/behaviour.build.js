const { BUILD: BEHAVIOUR_NAME } = require('behaviour_names');

const { REUSE_PATH } = require('constants');

const pathStyle = { stroke: '#ff00ff' };

function run(creep) {
	//initialize new creeps
	if (!creep.memory[BEHAVIOUR_NAME]) {
		creep.memory[BEHAVIOUR_NAME] = {
			lock: false
		};
	}

	//NOTE: building ramparts last
	let constructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, { filter: site => site.structureType != STRUCTURE_RAMPART });

	if (!constructionSite) {
		constructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, { filter: site => site.structureType == STRUCTURE_RAMPART });
	}

	if (!constructionSite) {
		return true;
	}

	const buildResult = creep.build(constructionSite);

	if (buildResult == OK) {
		//everything is OK, send a 'lock' message to TOP
		creep.memory[BEHAVIOUR_NAME].lock = true;
		return false;
	} else if (buildResult == ERR_NOT_IN_RANGE) {
		//TODO: move to closest?
		creep.moveTo(constructionSite, { reusePath: REUSE_PATH, visalizePathStyle: pathStyle });
		return false;
	}

	throw new Error(`Unknown state in ${BEHAVIOUR_NAME} for ${creep.name}: buildResult ${buildResult}`);
}

module.exports = run;
