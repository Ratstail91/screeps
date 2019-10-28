function handleMarket(spawn) {
	const terminal = spawn.room.terminal;

	if (terminal && Game.time % 1500 == 0) {
//		Game.notify(`Report: ${JSON.stringify(terminal.store)} - ${Game.market.credits} credits`);
	}

	if (true || !terminal || terminal.cooldown /* || terminal.store[RESOURCE_ENERGY] < 500 */) {
		return;
	}


	handleResource(RESOURCE_CATALYST, terminal);
	handleResource(RESOURCE_ZYNTHIUM, terminal);
	handleResource(RESOURCE_KEANIUM, terminal);
	handleResource(RESOURCE_LEMERGIUM, terminal);
	handleResource(RESOURCE_UTRIUM, terminal);
	handleResource(RESOURCE_OXYGEN, terminal);
	handleResource(RESOURCE_HYDROGEN, terminal);

	handleResource(RESOURCE_HYDROXIDE, terminal);
	handleResource(RESOURCE_ZYNTHIUM_KEANITE, terminal);
	handleResource(RESOURCE_UTRIUM_LEMERGITE, terminal);
	handleResource(RESOURCE_GHODIUM, terminal);

//	dumpEnergy(terminal); //get some money from the remaining energy
}

function dumpEnergy(terminal) {
	const sellAmount = terminal.store[RESOURCE_ENERGY] / 2;

	const buyOrders = Game.market.getAllOrders({ resourceType: RESOURCE_ENERGY, type: ORDER_BUY })
		.filter(bo => bo.price >= 0.003)
		.sort((a, b) =>
			Game.market.calcTransactionCost(sellAmount, a.roomName, terminal.room.name) -
			Game.market.calcTransactionCost(sellAmount, b.roomName, terminal.room.name)
		);

	if (buyOrders[0]) {
//		console.log(`cost: ${Game.market.calcTransactionCost(sellAmount, buyOrders[0].roomName, terminal.room.name)}`);
		Game.market.deal(buyOrders[0].id, sellAmount, terminal.room.name);
	}
}

function handleResource(resourceType, terminal) {
	if (resourceType == RESOURCE_ENERGY) {
		throw new Error("Can't sell energy yet");
	}

	const history = Game.market.getHistory(resourceType);
	const average = getFortnightlyAverage(resourceType);
	const sellOrders = Game.market.getAllOrders({ resourceType: resourceType, type: ORDER_SELL })
		.sort((a, b) => a.price - b.price) //lowest sell price first
		;
	const buyOrders = Game.market.getAllOrders({ resourceType: resourceType, type: ORDER_BUY })
		.sort((a, b) => b.price - a.price) //highest buy price first
		;

	if (buyOrders.length > 0 && buyOrders[0].price > average) {
//		console.log("buy order found");
		const result = confirmSale(buyOrders[0], terminal, average);

		switch(result) {
			case OK:
				break;

			case 1: //custom error code: no stock to sell
				break;

			case 2: //custom error code: not enough energy
				break;

			default:
				throw new Error(`Unexpected result in confirmSale: result ${result}`);
		}
	}

	//process the given data
	if (sellOrders.length > 0 && sellOrders[0].price <= average) {
//		console.log("sell order found");
		const result = confirmPurchase(sellOrders[0], terminal, average);

		switch(result) {
			case OK:
				break;

			case 1: //custom error code: no money to buy
				break;

			case 2: //custom error code: not enough energy
				break;

			default:
				throw new Error(`Unexpected result in confirmPurchase: result ${result}`);
		}
	}
}

function getFortnightlyAverage(resourceType) {
	const history = Game.market.getHistory(resourceType);

	if (!history.length) {
		return null;
	}

	let total = 0;
	history.forEach(day => total += day.avgPrice);
	return total / history.length;
}

function confirmPurchase(sellOrder, terminal, average) {
	const purchasable = Math.floor(Game.market.credits / sellOrder.price); //how many I can afford

	const amount = Math.min(purchasable, sellOrder.remainingAmount); //how many I can buy

	if (amount <= 100) {
		return 1;
	}

	//make sure there's enough energy there to sell
	if (Game.market.calcTransactionCost(amount, terminal.room.name, sellOrder.roomName) > terminal.store[RESOURCE_ENERGY]) {
		return 2;
	}

//	Game.notify(`Buying: ${sellOrder.resourceType} x${amount} for ${sellOrder.price} per unit (avg ${average})`);

	return Game.market.deal(sellOrder.id, amount, terminal.room.name);
}

function confirmSale(buyOrder, terminal, average) {
	const salable = terminal.store[buyOrder.resourceType]; //the stock I have to sell

	const amount = Math.min(salable, buyOrder.remainingAmount); //how many I can sell

	if (amount <= 100) {
		return 1;
	}

	//make sure there's enough energy there to sell
	if (Game.market.calcTransactionCost(amount, terminal.room.name, buyOrder.roomName) > terminal.store[RESOURCE_ENERGY]) {
		return 2;
	}

//	Game.notify(`Selling: ${sellOrder.resourceType} x${amount} for ${sellOrder.price} per unit (avg ${average})`);

	return Game.market.deal(buyOrder.id, amount, terminal.room.name);
}

module.exports = handleMarket;