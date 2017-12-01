var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    seq: {type: Number, unique: true, rquired: true},
	type: {type: Number, required: true},
    email: {type: String, unique: true, required: false},
    password: String,
    accessKey: {type: String, unique: true, required: true},
    pushToken: String,
    createDate: {type: Date, default: Date.now}
});

module.exports = mongoose.model('user', userSchema);