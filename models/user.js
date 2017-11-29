var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    seq: Number,
    email: String,
    password: String,
    accessKey: String
});

module.exports = mongoose.model('user', userSchema);