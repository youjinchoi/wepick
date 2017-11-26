var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    seq: Number,
    accessKey: String
});

module.exports = mongoose.model('user', userSchema);