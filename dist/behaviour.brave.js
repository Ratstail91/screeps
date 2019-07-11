const { BRAVE: BEHAVIOUR_NAME } = require('behaviour_names');

const pathStyle = { stroke: '#ff0000', opacity: 0.8 };

function run(creep) {
	const iAmRanged = creep.getActiveBodyparts(RANGED_ATTACK) > 0;

	//handle active hostiles
	const closestActiveHostile = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS, { filter: (hostile) => hostile.getActiveBodyparts(ATTACK) + hostile.getActiveBodyparts(RANGED_ATTACK) > 0 });

	if (closestActiveHostile) {
		const attackResult = iAmRanged ? creep.rangedAttack(closestActiveHostile) : creep.attack(closestActiveHostile);

		if (attackResult == OK || attackResult == ERR_NO_BODYPART) {
			//DO NOTHING
		} else if (attackResult == ERR_NOT_IN_RANGE) {
			creep.moveTo(closestActiveHostile, { reusePath: 1, visualizePathStyle: pathStyle });
		} else {
			throw new Error(`Unknown state in ${BEHAVIOUR_NAME} for ${creep.name}: iAmRanged ${iAmRanged} attackResult ${attackResult} closestActiveHostile ${JSON.stringify(closestActiveHostile)}`);
		}

		return false;
	}

	//handle disabled hostiles
	const closestDisabledHostile = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);

	if (closestDisabledHostile) {
		const attackResult = iAmRanged ? creep.rangedAttack(closestDisabledHostile) : creep.attack(closestDisabledHostile);

		if (attackResult == OK || attackResult == ERR_NO_BODYPART) {
			//DO NOTHING
		} else if (attackResult == ERR_NOT_IN_RANGE) {
			creep.moveTo(closestDisabledHostile, { reusePath: 1, visualizePathStyle: pathStyle });
		} else {
			throw new Error(`Unknown state in ${BEHAVIOUR_NAME} for ${creep.name}: iAmRanged ${iAmRanged} attackResult ${attackResult} closestDisabledHostile ${JSON.stringify(closestDisabledHostile)}`);
		}

		return false;
	}

	//fallthrough
	return true;
}

module.exports = run;