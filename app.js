var express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
var bodyParser = require('body-parser');
var db = require('./db');
var app = express();
app.use(bodyParser.json());

app.use('/questions', require('./routers/questions'));
app.use('/answers', require('./routers/answers'));
app.use('/users', require('./routers/users'));
app.use('/login', require('./routers/login'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(function(req, res){
    res.redirect('/api-docs');
});

app.listen(8080, function () { 
    console.log('Wepick app listening on port 8080!');
});