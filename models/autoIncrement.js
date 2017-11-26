var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var autoIncrementSchema = new Schema({
    _id: String,
    seq: Number
});

module.exports = mongoose.model('autoIncrement', autoIncrementSchema);