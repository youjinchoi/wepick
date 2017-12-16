var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var answerSchema = new Schema({
	question: Number,
	answerer: Number,
	questioner: Number,
    type: Number,
    selection: Number,
    createDate: {type: Date, default: Date.now}
});

module.exports = mongoose.model('answer', answerSchema);