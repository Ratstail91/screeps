const handleSpawn = require('spawns');
const handleModule = require('modules');

//for updating existing creeps
function updateCreep(creep) {
	switch(creep.memory.role) {
		//domestics
		case undefined:
		case 'harvester':
		case 'upgrader':
		case 'builder':
		case 'repairer':
			creep.memory['HARVEST'] = { remote: null, source: null };
			creep.memory.modules = ['TOP', 'HARVEST', 'STORE', 'UPGRADE', 'BOTTOM'];
			break;

		//ignore (too niche to be worth upgrading)
		case 'scout':
		case 'scavenger':
		case 'signwriter':
		case 'claimer':
		case 'storemanager':
		default:
			break;
	}

	//finally
	creep.memory.role = null;
}

module.exports.loop = () => {
	//run the spawn AI
	for (const spawnName in Game.spawns) {
		handleSpawn(Game.spawns[spawnName]);
	}

	//run the creep AI
	for (const creepName in Game.creeps) {
		const creep = Game.creeps[creepName];

		//compatability (remove this)
		updateCreep(creep);

		//if a module returns false, break the loop
		for (const index in creep.memory.modules) {
			if (!handleModule(creep, creep.memory.modules[index])) {
				break;
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
