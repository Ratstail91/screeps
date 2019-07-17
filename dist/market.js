//attempt to sell some energy
function run(terminal) {
	//find energy orders
	let buyOrders = Game.market.getAllOrders(order => {
		return order.type == ORDER_BUY && order.resourceType == RESOURCE_ENERGY && order.remainingAmount <= terminal.store[RESOURCE_ENERGY]
	});

	//none found
	if (buyOrders.length == 0) {
		return;
	}

	//calc the costs of each transaction
	buyOrders = buyOrders.map(order => {
		order.cost = Game.market.calcTransactionCost(terminal.room.name, order.roomName, order.remainingAmount);
		return order;
	});

	//filter out if costs are too high
	buyOrders = buyOrders.filter(order => {
		return order.cost + order.remainingAmount <= terminal.store[RESOURCE_ENERGY];
	});

	if (buyOrders.length == 0) {
		return;
	}

	//sort to find the lowest cost vs. price
	buyOrders = buyOrders.sort((a, b) => a.cost/a.price - b.cost/b.price);

	//too expensive, not worth it (just log it for now and accept it)
	console.log('buyOrder:', buyOrder[0].cost, buyOrder[0].price, buyOrders[0].cost / buyOrders[0].price);
//	if (buyOrders[0].cost / buyOrders[0].price > ???) {
//		return;
//	}

	const res = Game.market.deal(buyOrders[0].id, buyOrders.remainingAmount, terminal.room.name);

	if (res != OK) {
		throw new Error(`Unknown error in the market: ${res}`);
	}
}

module.exports = run;