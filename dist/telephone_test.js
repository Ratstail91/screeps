const {
	TELEPHONE_ERR_NOT_INITIALIZED,
	TELEPHONE_ERR_WRONG_PLAYER,
	TELEPHONE_ERR_WRONG_PROTOCOL,
	TELEPHONE_ERR_PLAYER_NOT_CONNECTED,
	TELEPHONE_INFO,
	TELEPHONE_HELP,
	TELEPHONE_INFO_ANY,
	TELEPHONE_HELP_NONE,
	TELEPHONE_HELP_ENERGY,
	TELEPHONE_HELP_DEFEND,
	TELEPHONE_HELP_ATTACK,
	initializeTelephone,
	checkTelephone,
	closeTelephone,
	setTelephone,
	requestTelephone,
	getTelephone,
} = require("telephone");

function telephoneTest() {
	//initialize the tester
	Memory.telephoneTest2 = Memory.telephoneTest2 + 1 || 1;

	//switch between test stages
	switch(Memory.telephoneTest2) {
		//check the initialization and closure of the telephone system
		case 1:
			//reset everything
			closeTelephone();

			console.log("Please wait while the test is run. This may take some time.");

			if (checkTelephone()) {
				console.log(`Fail (${Memory.telephoneTest}): checkTelephone()`);
			}

			return;

		case 2:
			if (!checkTelephone()) {
				console.log(`Fail (${Memory.telephoneTest}): checkTelephone()`);
			}

			closeTelephone();

			return;

		case 3:
			if (checkTelephone()) {
				console.log(`Fail (${Memory.telephoneTest}): checkTelephone()`);
			}

			//all things good.
			return;

		//test the set/get system after re-initialzing
		case 4:
			initializeTelephone();

			return;

		case 5:
			//I'll access this to test it afterwards
			setTelephone(TELEPHONE_INFO, TELEPHONE_INFO_ANY, "The quick brown fox jumps over the lazy dog.");

			//ask for my public info segment
			requestTelephone("Ratstail91", TELEPHONE_INFO);

			return;

		case 6: {
			const swordText = getTelephone("Ratstail91", TELEPHONE_INFO);

			if (swordText != "It's dangerous to go alone! Take this.") {
				console.log(`Fail (${Memory.telephoneTest}): getTelephone() (sword text: ${swordText})`);
			}

			return;
		}

		case 7:
			console.log("Test complete.");
			console.log("Your telephone system is currently open, so please inform Ratstail91 that it is ready to be tested from his end.");

			return;
	}
}

module.exports = telephoneTest;