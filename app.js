var path = require('path');
var querystring = require('querystring'); 
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test');
var db = mongoose.connection;
db.on('error', function(){
    console.log('MongoDB Connection Failed!');
});
db.once('open', function() {
    console.log('MongoDB Connected!');
});

app.use(bodyParser.urlencoded({ extended: false }));

app.get('/questions', function(req, res) {
    var questions = db.collection('test').find().toArray(function(error, data){
            res.writeHead(200, {'Content-Type':'application/json;charset=UTF-8'});
            res.end(JSON.stringify(data));
        });      
});

app.post('/questions', function(req, res){
    var body = req.body;
    db.collection('test').insert({questioner:body.questioner, contents:body.contents, options:body.options});
    res.writeHead(200, {'Content-Type':'application/json'});
    res.end('{"status":"OK"}');
});

app.use('/swagger-ui', express.static(path.join(__dirname, './node_modules/swagger-ui/dist')));

app.listen(3000, function () { 
    console.log('Example app listening on port 3000!');
});
