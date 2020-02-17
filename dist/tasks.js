const pushTask = (type, opt) => {
	const task = Object.assign({ assigned: null, room: null }, opt, { type: type });

	Memory.tasks.push(task);
};

const getMatchingTask = (type, opt) => {
	if (Memory.tasks.length === 0) {
		return null;
	}

	//find the index of the first that matches the parameters
	const index = Memory.tasks.findIndex(t => {
		if (t.type !== type) {
			return false;
		}

		//short circuit without opts
		if (!opt) {
			return true;
		}

		if (t.assigned && t.assigned !== opt.assigned) {
			return false;
		}

		if (t.room && t.room !== opt.room) {
			return false;
		}

		return true;
	});

	if (index < 0) {
		return null;
	}

	return Memory.tasks.splice(index, 1)[0];
};

module.exports = {
	pushTask,
	getMatchingTask,
};