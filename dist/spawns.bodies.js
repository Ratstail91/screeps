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

	//100 * 3 = 300
	WORK, WORK, WORK
];

const largeFightBody = [ //1250
	//10 * 10 = 100
	TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
	TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,

	//50 * 15 = 750
	MOVE, MOVE, MOVE, MOVE, MOVE,
	MOVE, MOVE, MOVE, MOVE, MOVE,
	MOVE, MOVE, MOVE, MOVE, MOVE,

	//80 * 3 = 400
	ATTACK, ATTACK, ATTACK, ATTACK, ATTACK,
];

const largeLorryBody = [ //1200
	//50 * 8 = 400
	MOVE, MOVE, MOVE, MOVE, MOVE,
	MOVE, MOVE, MOVE,

	//50 * 16 = 800
	CARRY, CARRY, CARRY, CARRY, CARRY,
	CARRY, CARRY, CARRY, CARRY, CARRY,
	CARRY, CARRY, CARRY, CARRY, CARRY,
	CARRY,
];

const largeSlowBody = [ //1200
	//50 * 5 = 250
	MOVE, MOVE, MOVE, MOVE, MOVE,

	//50 * 1 = 50
	CARRY,

	//100 * 9 = 900
	WORK, WORK, WORK, WORK, WORK,
	WORK, WORK, WORK, WORK,
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

const hugeLorryBody = [ //1800
	//50 * 12 = 600
	MOVE, MOVE, MOVE, MOVE, MOVE,
	MOVE, MOVE, MOVE, MOVE, MOVE,
	MOVE, MOVE,

	//50 * 24 = 1200
	CARRY, CARRY, CARRY, CARRY, CARRY,
	CARRY, CARRY, CARRY, CARRY, CARRY,
	CARRY, CARRY, CARRY, CARRY, CARRY,
	CARRY, CARRY, CARRY, CARRY, CARRY,
	CARRY, CARRY, CARRY, CARRY,
];

const hugeSlowBody = [//1700
	//50 * 7 = 350
	MOVE, MOVE, MOVE, MOVE, MOVE,
	MOVE, MOVE,

	//50 * 1 = 50
	CARRY,

	//100 * 13 = 1300
	WORK, WORK, WORK, WORK, WORK,
	WORK, WORK, WORK, WORK, WORK,
	WORK, WORK, WORK,
];

//specialized bodies
const claimerBody = [//1300
	MOVE, MOVE, CLAIM, CLAIM
];

module.exports = {
	tinyBody,

	smallLorryBody,
	smallFightBody,

	mediumBody,
	mediumLorryBody,

	largeBody,
	largeFightBody,
	largeLorryBody,
	largeSlowBody,

	hugeBody,
	hugeLorryBody,
	hugeSlowBody,

	claimerBody
};