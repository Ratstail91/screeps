const allies = require('allies');

const {
	TELEPHONE_ERR_NOT_INITIALIZED,
	TELEPHONE_ERR_WRONG_PLAYER,
	TELEPHONE_ERR_WRONG_PROTOCOL,
	TELEPHONE_ERR_PLAYER_NOT_CONNECTED,
	TELEPHONE_ERR_NO_DATA,
	TELEPHONE_INFO,
	TELEPHONE_HELP,
	TELEPHONE_INFO_NONE,
	TELEPHONE_INFO_ANY,
	TELEPHONE_INFO_NOTIFY,
	TELEPHONE_HELP_NONE,
	TELEPHONE_HELP_ENERGY,
	TELEPHONE_HELP_DEFEND,
	TELEPHONE_HELP_ATTACK,
	initializeTelephone,
	closeTelephone,
	setTelephone,
	requestTelephone,
	getTelephone,
} = require('telephone');

function handleTelephone() {
	//initialize the telephone handler
	if (!Memory._handleTelephone) {
		Memory._handleTelephone = {
			stage: 0,
			ally: 0,
		};
	}

	//do stuff
	switch(Memory._handleTelephone.stage) {
		//check info
		case 1:
			requestTelephone(allies[Memory._handleTelephone.ally], TELEPHONE_INFO);
			break;

		case 2:
			handleTelephoneInfo();
			break;

		//check help
		case 3:
			requestTelephone(allies[Memory._handleTelephone.ally], TELEPHONE_HELP);
			break;

		case 4:
			handleTelephoneHelp();
			break;

		default:
			Memory._handleTelephone.ally = (Memory._handleTelephone.ally + 1) % allies.length;
			Memory._handleTelephone.stage = 0;
		break;
	}

	Memory._handleTelephone.stage = Memory._handleTelephone.stage + 1;
}

function handleTelephoneInfo() {
	const result = getTelephone(allies[Memory._handleTelephone.ally], TELEPHONE_INFO);

	//handle errors
	switch(result) {
		case TELEPHONE_ERR_NOT_INITIALIZED:
			throw new Error("Your telephone is not initialized");

		case TELEPHONE_ERR_PLAYER_NOT_CONNECTED:
//			console.log(`Player ${allies[Memory._handleTelephone.ally]} is not connected to the telephone system`);
			break;

		case TELEPHONE_ERR_NO_DATA:
			//no data, don't continue
			return;

		default:
			if (typeof(result) == "object") {
				break;
			}

			throw new Error(`Unexpected error from getTelephone: result ${result}`)
	}

	//handle the mode
	const msg = `${allies[Memory._handleTelephone.ally]}: ${result.data}`;

	switch(result.mode) {
		case TELEPHONE_INFO_NONE:
			//do nothing
			break;

		case TELEPHONE_INFO_ANY:
			console.log(msg);
			break;

		case TELEPHONE_INFO_NOTIFY:
			console.log(msg);
			Game.notify(msg);
			break;
	}
}

function handleTelephoneHelp() {
	const result = getTelephone(allies[Memory._handleTelephone.ally], TELEPHONE_HELP);

	//handle errors
	switch(result) {
		case TELEPHONE_ERR_NOT_INITIALIZED:
			throw new Error("Your telephone is not initialized");

		case TELEPHONE_ERR_PLAYER_NOT_CONNECTED:
//			console.log(`Player ${allies[Memory._handleTelephone.ally]} is not connected to the telephone system`);
			break;

		case TELEPHONE_ERR_NO_DATA:
			//no data, don't continue
			return;

		default:
			if (typeof(result) == "object") {
				break;
			}

			throw new Error(`Unexpected error from getTelephone: result ${result}`)
	}

	//handle the mode
	switch(result.mode) {
		case TELEPHONE_HELP_NONE:
			//do nothing
			break;

		case TELEPHONE_HELP_ENERGY:
			sendEnergy(allies[Memory._handleTelephone.ally], result.data);
			break;

		case TELEPHONE_HELP_DEFEND:
			//TODO: send defences
			break;

		case TELEPHONE_HELP_ATTACK:
			//TODO: attack target
			break;
	}
}

//how to help other players
function sendEnergy(player, destination) {
	const terminals = Object.values(Game.spawns)
		.filter(s => s.name.startsWith("Spawn")) //ignore surrogates
		.map(s => s.room.terminal)
		.filter(t => t.store[RESOURCE_ENERGY] >= 1000) //must have energy to send
		;

	if (terminals.length == 0) {
		return;
	}

	//hacky check
	try {
		new Room.Terrain(destination);
	} catch(e) {
		console.log(`Garbage room name received from ${player}: data ${destination}`);
	}

	console.log(`Sending emergency supply drop to ${player} at ${destination}`);

	terminals.forEach(t => t.send(RESOURCE_ENERGY, t.store[RESOURCE_ENERGY] /2, destination, "emergency supply drop"));
}

module.exports = handleTelephone;
