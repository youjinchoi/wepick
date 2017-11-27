var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var questionSchema = new Schema({
    seq: Number,
	questioner: Number,
    contents: String,
    options: String,
    maxAnswerCount: { type: Number, default: 50 },
    answerCount: { type: Number, default: 0 },
    isClosed: { type: Boolean, default: false }
});

module.exports = mongoose.model('question', questionSchema);