var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var verificationSchema = new Schema({
    seq: Number,
    code: Number
});

module.exports = mongoose.model('verification', verificationSchema);