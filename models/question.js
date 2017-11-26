var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var questionSchema = new Schema({
    seq: Number,
	questioner: Number,
    contents: String,
    options: String
});

module.exports = mongoose.model('question', questionSchema);