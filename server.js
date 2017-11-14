var http = require('http'); 

var url = require('url');
var querystring = require('querystring'); 

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test');
var db = mongoose.connection;
db.on('error', function(){
    console.log('MongoDB Connection Failed!');
});
db.once('open', function() {
    console.log('MongoDB Connected!');
});

var question = mongoose.Schema({
    questioner : 'string',
    contents : 'string',
    options : 'string'
});

var Question = mongoose.model('Schema', question);

var server = http.createServer(function(request,response){ 

    console.log('--- log start ---');
    var parsedUrl = url.parse(request.url);
    var resource = parsedUrl.pathname;
    var parsedQuery = querystring.parse(parsedUrl.query,'&','=');
    
    console.log('resource', resource);    
    if(resource == '/questions/list') {
        var questions = db.collection('test').find().toArray(function(error, data){
          response.writeHead(200, {'Content-Type':'application/json'});
          response.end(JSON.stringify(data));
        });      

    } else if (resource == '/questions/add') {
        var postdata = '';
        request.on('data', function(data){
            postdata = postdata + data;
        })

        request.on('data', function(data){
            var pq = querystring.parse(postdata);
            db.collection('test').insert({questioner:pq.questioner, contents:pq.contents, options:pq.options});
            response.writeHead(200, {'Content-Type':'application/json'});
            response.end('{"status":"OK"}');
        })

    } else {
        response.writeHead(404, {'Content-Type':'text/html'});
        response.end('404 Page Not Found');
    }
});

server.listen(8080, function(){ 
    console.log('Server is running...');
});
