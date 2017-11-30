var util = {};

util.getRandomNumber = function(from, to) {
	return Math.floor((Math.random() * to) + from);
}

module.exports = util;