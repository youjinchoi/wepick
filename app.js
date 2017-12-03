var express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
var bodyParser = require('body-parser');
var db = require('./db');
var commonResponse = require('./commons/commonResponse');
var NoAccessKeyError = require('./errors/NoAccessKeyError');
var NoUserError = require('./errors/NoUserError');
var app = express();
app.use(bodyParser.json());

app.use('/questions', require('./routers/questions'));
app.use('/answers', require('./routers/answers'));
app.use('/members', require('./routers/members'));
app.use('/guests', require('./routers/guests'));
app.use('/login', require('./routers/login'));
app.use('/verifications', require('./routers/verifications'));
app.use('/pushes', require('./routers/pushes'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(function(req, res){
    res.redirect('/api-docs');
});

app.use(function (err, req, res, next) {
	console.error(err);
	if (err instanceof NoAccessKeyError) {
		commonResponse.noAccessKey(res);
	} else if (err instanceof NoUserError) {
		commonResponse.noUser(res);
	} else {
		commonResponse.error(res);
	}
})

app.listen(8080, function () { 
    console.log('Wepick app listening on port 8080!');
});