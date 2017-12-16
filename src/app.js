var express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
var bodyParser = require('body-parser');
var db = require('./db');
var commonResponse = require('./commons/commonResponse');
var NoAccessKeyError = require('./errors/NoAccessKeyError');
var NoUserError = require('./errors/NoUserError');
var app = express();

process.on('uncaughtException', function (error) {
	console.error(error);
});

app.use(bodyParser.json());

app.use('/questions', require('./routers/questions'));
app.use('/answers', require('./routers/answers'));
app.use('/members', require('./routers/members'));
app.use('/guests', require('./routers/guests'));
app.use('/login', require('./routers/login'));
app.use('/logout', require('./routers/logout'));
app.use('/verifications', require('./routers/verifications'));
app.use('/pushes', require('./routers/pushes'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(function(req, res){
    res.redirect('/api-docs');
});

app.use(function (error, req, res) {
	console.error(error);
	if (error instanceof NoAccessKeyError) {
		commonResponse.noAccessKey(res, error.message);
	} else if (error instanceof NoUserError) {
		commonResponse.noUser(res, error.message);
	} else {
		commonResponse.error(res, error.message);
	}
});

const args = require('yargs').argv;
const port = args.port;

app.listen(port, function () { 
    console.log('Wepick app listening on port ' + port + '!');
});