var mongoose = require('mongoose');
var vars = require('../config/vars');

mongoose.Promise = global.Promise;
mongoose.connect(vars.db.address);
var db = mongoose.connection;
db.on('error', function(){
    console.log('MongoDB Connection Failed!');
});
db.once('open', function() {
    console.log('MongoDB Connected!');
});

module.exports = db;
