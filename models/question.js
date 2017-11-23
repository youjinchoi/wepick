var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var questionSchema = new Schema({
    questioner: String,
    contents: String,
    options: String
});

module.exports = mongoose.model('question', questionSchema);