var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var verificationSchema = new Schema({
    seq: Number,
    code: Number,
    createDate: {type: Date, default: Date.now}
});

module.exports = mongoose.model('verification', verificationSchema);