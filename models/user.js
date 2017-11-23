var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    uuid: String,
    accessKey: String
});

module.exports = mongoose.model('user', userSchema);