//assume 300e available - tinybody is 250e
const tinyBody = [MOVE, MOVE, WORK, CARRY];

//550e available
const smallLorryBody = [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY]; //500
const smallFightBody = [TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK]; //500

//800e available
const mediumBody = [ //800
	MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
	CARRY, CARRY, CARRY, CARRY, CARRY, WORK, WORK
];

const mediumLorryBody = [ //800
	MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
	CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY
];

//1300e available
const largeBody = [ //1250
	//50 * 11 = 550
	MOVE, MOVE, MOVE, MOVE, MOVE,
	MOVE, MOVE, MOVE, MOVE, MOVE,
	MOVE,

	//50 * 8 = 400
	CARRY, CARRY, CARRY, CARRY, CARRY,
	CARRY, CARRY, CARRY,

	//3 * 100 = 300
	WORK, WORK, WORK
];

const largeFightBody = [ //1200
	//10 * 10 = 100
	TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
	TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,

	//50 * 13 = 650
	MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
	MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
	MOVE, MOVE, MOVE,

	//150 * 3 = 450
	RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK
];

//1800e available
const hugeBody = [ //1800
	//50 * 16 = 800
	MOVE, MOVE, MOVE, MOVE, MOVE,
	MOVE, MOVE, MOVE, MOVE, MOVE,
	MOVE, MOVE, MOVE, MOVE, MOVE,
	MOVE,

	//50 * 12 = 600
	CARRY, CARRY, CARRY, CARRY, CARRY,
	CARRY, CARRY, CARRY, CARRY, CARRY,
	CARRY, CARRY,

	//100 * 4 = 400
	WORK, WORK, WORK, WORK
];

const hugeSlowBody = [ //1800
	//50 * 6 = 300
	MOVE, MOVE, MOVE, MOVE, MOVE,
	MOVE,

	//50 * 10 = 500
	CARRY, CARRY, CARRY, CARRY, CARRY,
	CARRY, CARRY, CARRY, CARRY, CARRY,

	//100 * 10 = 1000
	WORK, WORK, WORK, WORK, WORK,
	WORK, WORK, WORK, WORK, WORK,
];

//specialized bodies
const claimerBody = [
	MOVE, CLAIM
];

module.exports = {
	tinyBody: tinyBody,

	smallLorryBody: smallLorryBody,
	smallFightBody: smallFightBody,

	mediumBody: mediumBody,
	mediumLorryBody: mediumLorryBody,

	largeBody: largeBody,
	largeFightBody: largeFightBody,

	hugeBody: hugeBody,
	hugeSlowBody: hugeSlowBody,

	claimerBody: claimerBody
};