var express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
var bodyParser = require('body-parser');
var db = require('./db');
var session = require('express-session');
var vars = require('../config/vars');
var commonResponse = require('./commons/commonResponse');
var NoAccessKeyError = require('./errors/NoAccessKeyError');
var NoUserError = require('./errors/NoUserError');
var AuthenticationError = require('./errors/AuthenticationError');
var DuplicationError = require('./errors/DuplicationError');
var EmailNotFoundError = require('./errors/EmailNotFoundError');
var app = express();

process.on('uncaughtException', function (error) {
	console.error(error);
});

app.use(bodyParser.json());

app.use(session({
	 secret: vars.serverKey,
	 resave: false,
	 saveUninitialized: true
}));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.get('/connection-test', function (req, res) {
	res.status(200).send(global.dbConnection);
});

app.use('/questions', require('./routers/questions'));
app.use('/answers', require('./routers/answers'));
app.use('/users', require('./routers/users'));
app.use('/members', require('./routers/members'));
app.use('/guests', require('./routers/guests'));
app.use('/login', require('./routers/login'));
app.use('/logout', require('./routers/logout'));
app.use('/verifications', require('./routers/verifications'));
app.use('/pushes', require('./routers/pushes'));
app.use('/admin', require('./routers/admin'));
app.use('/static', express.static(__dirname + '/static'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(function(req, res){
    res.redirect('/api-docs');
});

app.use(function (error, req, res, next) {
	console.error(error);
	if (error instanceof NoAccessKeyError) {
		commonResponse.noAccessKey(res, error.message);
	} else if (error instanceof NoUserError) {
		commonResponse.noUser(res, error.message);
	} else if (error instanceof AuthenticationError) {
		commonResponse.authentication(res, error.message);
	} else if (error instanceof DuplicationError) {
		commonResponse.duplication(res, error.message);
	} else if (error instanceof EmailNotFoundError) {
		commonResponse.emailNotFound(res, error.message);
	} else {
		commonResponse.error(res, error.message);
	}
});

const args = require('yargs').argv;
const port = args.port || 8080;

app.listen(port, function () { 
    console.log('Wepick app listening on port ' + port + '!');
});