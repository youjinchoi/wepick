var mongoose = require('mongoose');
//for dev
//mongoose.connect('mongodb://10.106.144.145:27017/test');
//for real
mongoose.connect('mongodb://localhost:27017/test');
var db = mongoose.connection;
db.on('error', function(){
    console.log('MongoDB Connection Failed!');
});
db.once('open', function() {
    console.log('MongoDB Connected!');
});

module.exports = db;
