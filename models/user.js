var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    seq: {type: Number, index:true, unique: true, required: true},
	type: {type: Number, required: true},
    email: {type: String, index: true, trim: true, unique: true, required: false, sparse: true},
    password: String,
    accessKey: {type: String, index:true, unique: true, required: true},
    pushToken: String,
    createDate: {type: Date, default: Date.now}
});

module.exports = mongoose.model('user', userSchema);