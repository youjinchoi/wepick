var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var answerSchema = new Schema({
    seq: Number,
	question: Number,
	questioner: Number,
    answerer: Number,
    selection: Number
});

module.exports = mongoose.model('answer', answerSchema);