//attempt to sell some energy
function run(terminal) {
	//find energy orders
	let buyOrders = Game.market.getAllOrders(order => {
		return order.type == ORDER_BUY && order.resourceType == RESOUCE_ENERGY && order.remainingAmount <= terminal.store[RESOUCE_ENERGY]
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
		return order.cost + order.remainingAmount <= terminal.store[RESOUCE_ENERGY];
	});

	if (buyOrders.length == 0) {
		return;
	}

	//sort to find the lowest cost
	buyOrders = buyOrders.sort((a, b) => a.cost - b.cost);

	Game.market.deal(buyOrders[0].id, buyOrders.remainingAmount, terminal.room.name);
}

module.exports = run;