var AutoIncrement = require('./models/autoIncrement');

var getNextSeq = function(type) {
	return AutoIncrement.findByIdAndUpdate(
		type, 
        { $inc: { seq: 1 } },
        {
        	new: true,
        	upsert: true
        }
    );
}

module.exports = getNextSeq;