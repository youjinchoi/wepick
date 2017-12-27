var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var skipSchema = new Schema({
	question: Number,
	skipUser: Number,
	questioner: Number,
    createDate: {type: Date, default: Date.now}
});

module.exports = mongoose.model('skip', skipSchema);