var express = require('express');
var router = express.Router();
var Question = require('../models/question');
var Answer = require('../models/answer');
var commonResponse = require('../commons/commonResponse');
var InvalidParameterError = require('../errors/InvalidParameterError');
var path = require('path');
var vars = require('../../config/vars');
var AuthenticationError = require('../errors/AuthenticationError')

router.post('/login', function(req, res) {
	var serverKey = req.get('Server-Key');
	if (!serverKey) {
		throw new InvalidParameterError('Server-Key is required.');
	}

	if (serverKey == vars.serverKey) {
		req.session.adminPasscode = serverKey;
		commonResponse.ok(res);
	} else {
		throw new AuthenticationError();
	}
});

router.delete('/questions/:questionSeq', function(req, res, next) {
	var session = req.session;
	if (!session.adminPasscode || session.adminPasscode != vars.serverKey) {
		throw new AuthenticationError();
	}
	
	var questionSeq = req.params.questionSeq;
	Question.findOne({'seq': questionSeq})
	.then(question => {
		if (!question) {
			throw new Error();
		}

		console.log('ADMIN deletes question', question);
		var questionerSeq = question.questioner;
		return Question.remove({'seq': questionSeq, 'questioner': question.questioner}).then(() => questionerSeq);
	})
	.then((questionerSeq) => {
		return Answer.remove({'questioner': questionerSeq});
	})
	.then(() => {
		commonResponse.ok(res);
	})
	.catch(next);
});

router.use(function(req, res) {
	var session = req.session;
	var isLoggedIn = false;
	if (session.adminPasscode && session.adminPasscode == vars.serverKey) {
		isLoggedIn = true;
	}
	
	res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
	res.header('Expires', '-1');
	res.header('Pragma', 'no-cache');
	const phase = require('yargs').argv.phase || 'local';
	res.render('index', {
		isLoggedIn: isLoggedIn,
        appSrc: phase == 'local' ? "http://localhost:7777/app.js" : "/static/js/app.js"
    });
});

module.exports = router;