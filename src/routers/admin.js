var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user');
var Question = require('../models/question');
var Answer = require('../models/answer');
var commonResponse = require('../commons/commonResponse');
var messages = require('../commons/messages');
var InvalidParameterError = require('../errors/InvalidParameterError');
var path = require('path');
var vars = require('../../config/vars');
var AuthenticationError = require('../errors/AuthenticationError');
var EmailNotFoundError = require('../errors/EmailNotFoundError');
var mailSender = require('../commons/mailSender');

router.post('/admin-login', function(req, res) {
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

router.post('/admin-logout', function(req, res, next) {
	req.session.adminPasscode = null;
	commonResponse.ok(res);
});

router.post('/user-login', function(req, res, next) {
	var body = req.body;
	if (!body.email) {
		commonResponse.error(res, "email is required.");
		return;
	}
	if (!body.password) {
		commonResponse.error(res, "password is required.");
		return;
	}
	User.findOne({'email': body.email})
	.then(user => {
		if (!user) {
			throw new EmailNotFoundError(messages.EMAIL_NOT_FOUND);
		}
		var password = crypto.createHash('sha256').update(body.password).digest('hex');
		if (user.password != password) {
			throw new AuthenticationError(messages.INVALID_PASSWORD);
		}
		req.session.userEmail = body.email;
		req.session.userAccessKey = user.accessKey;
		commonResponse.ok(res, {accessKey: user.accessKey});
	})
	.catch(next);
});

router.post('/user-logout', function(req, res, next) {
	req.session.userEmail = null;
	req.session.userAccessKey = null;
	commonResponse.ok(res);
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
		return Question.remove({'seq': questionSeq, 'questioner': question.questioner}).then(() => question);
	})
	.then((question) => {
		return Answer.remove({'questioner': question.questioner}).then(() => question);
	})
	.then((question) => {
		return User.findOne({'seq': question.questioner}).then(user => {
			return {user: user, question: question};
		});
	})
	.then(data => {
		if (data.user && data.user.email) {
			mailSender.sendQuestionDeleteNofi(data.user.email, data.question)
			.then((result) => {
				console.log(result);
				const isSuccess = result.accepted && result.accepted.length > 0;
				commonResponse.ok(res, isSuccess ? '삭제 후 안내 메일 발송이 완료되었습니다.' : '삭제 후 안내 메일 발송에 실패하였습니다.');
			});
		} else {
			commonResponse.ok(res, '삭제가 완료되었습니다.');
		}
	})
	.catch(next);
});

router.use(function(req, res) {
	var session = req.session;
	
	res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
	res.header('Expires', '-1');
	res.header('Pragma', 'no-cache');
	const phase = require('yargs').argv.phase || 'local';
	res.render('index', {
		isAdminLoggedIn: !!session.adminPasscode && session.adminPasscode == vars.serverKey,
		isUserLoggedIn: !!session.userEmail && !!session.userAccessKey, 
		userEmail: session.userEmail,
		userAccessKey: session.userAccessKey,
        appSrc: phase == 'local' ? "http://localhost:7777/app.js" : "/static/js/app.js"
    });
});

module.exports = router;