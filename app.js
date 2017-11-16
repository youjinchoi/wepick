var express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
var bodyParser = require('body-parser');
var app = express();
var mongoose = require('mongoose');
// for dev
//mongoose.connect('mongodb://10.106.144.145:27017/test');
// for real
mongoose.connect('mongodb://localhost:27017/test');
var db = mongoose.connection;
db.on('error', function(){
    console.log('MongoDB Connection Failed!');
});
db.once('open', function() {
    console.log('MongoDB Connected!');
});

app.use(bodyParser.json());

app.get('/questions', function(req, res) {
    db.collection('test').find().toArray(function(error, data){
            var apiResponse = {
                status: "OK",
                result: data
            };
            res.writeHead(200, {'Content-Type':'application/json;charset=UTF-8'});
            res.end(JSON.stringify(apiResponse));
        });      
});

app.post('/questions', function(req, res){
    var body = req.body;
    db.collection('test').insert({questioner:body.questioner, contents:body.contents, options:body.options});
    var apiResponse = {
        status: "OK"
    };
    res.writeHead(200, {'Content-Type':'application/json'});
    res.end(JSON.stringify(apiResponse));
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(function(req, res){
    res.redirect('/api-docs');
});

app.listen(8080, function () { 
    console.log('Wepick app listening on port 8080!');
});