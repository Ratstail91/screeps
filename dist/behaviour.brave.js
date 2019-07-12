const { BRAVE: BEHAVIOUR_NAME } = require('behaviour_names');

const pathStyle = { stroke: '#ff0000', opacity: 0.8 };

function attackHostiles(creep, filter) {
	const iAmRanged = creep.getActiveBodyparts(RANGED_ATTACK) > 0;

	//handle hostiles based on a filter
	const closestHostile = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS, { filter: filter });

	if (closestHostile) {
		const attackResult = iAmRanged ? creep.rangedAttack(closestHostile) : creep.attack(closestHostile);

		if (attackResult == OK || attackResult == ERR_NO_BODYPART) {
			//DO NOTHING
		} else if (attackResult == ERR_NOT_IN_RANGE) {
			creep.moveTo(closestHostile, { reusePath: 1, visualizePathStyle: pathStyle });
		} else {
			throw new Error(`Unknown state in ${BEHAVIOUR_NAME} for ${creep.name}: iAmRanged ${iAmRanged} attackResult ${attackResult} closestHostile ${JSON.stringify(closestHostile)}`);
		}

		return false;
	}

	return true;
}

function run(creep) {
	return (
		attackHostiles(creep, (hostile) => hostile.getActiveBodyparts(HEAL) > 0) &&
		attackHostiles(creep, (hostile) => hostile.getActiveBodyparts(ATTACK) + hostile.getActiveBodyparts(RANGED_ATTACK) > 0) &&
		attackHostiles(creep, (hostile) => true)
	);
}

module.exports = run;