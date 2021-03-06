var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var questionSchema = new Schema({
    seq: Number,
	questioner: Number,
    contents: String,
    options: Array,
    maxAnswerCount: { type: Number, default: 50 },
    answerCount: { type: Number, default: 0 },
    answerers: { type: Array, default: [] },
    skipUsers: { type: Array, default: [] },
    isClosed: { type: Boolean, default: false },
    createDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('question', questionSchema);