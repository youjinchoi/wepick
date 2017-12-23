var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Question = require('../models/question');
var commonResponse = require('../commons/commonResponse');
var NoAccessKeyError = require('../errors/NoAccessKeyError');
var NoUserError = require('../errors/NoUserError');
var NotFoundError = require('../errors/NotFoundError');
var messages = require('../commons/messages');
var pushSender = require('../commons/pushSender');
var vars = require('../../config/vars');

router.post('/', function(req, res, next) {
	var serverKey = req.get('Server-Key');
	if (serverKey != vars.serverKey) {
		commonResponse.error(res);
		return;
	}
	var questionSeq = req.body.questionSeq;
	var selection = req.body.selection;
	Question.findOne({'seq': questionSeq})
	.then(question => {
		if (!question) {
			throw new NotFoundError('Question not found.');
		}
		return User.findOne({'seq': question.questioner}).then(user => {
			return {user: user, question: question};
		})
	})
	.then(data => {
		if (!data.user) {
			throw new NotFoundError('Questioner not found.');
		}
		var user = data.user;
		if (!user.pushToken) {
			commonResponse.ok(res);
		}
		
		var question = data.question;
		pushSender.sendAnswerToQuestioner(user.pushToken, question.seq, question.contents, question.options[selection].value, question.answerCount)
		.then(result => {
			console.log(result);
			commonResponse.ok(res);
		})
		.catch(next);
	})
	.catch(next);
});

router.put('/tokens', function(req, res, next){
	var accessKey = req.get('Access-Key');
	if (!accessKey) {
		throw new NoAccessKeyError(messages.NO_ACCESS_KEY);
	}
	
	User.findOne({'accessKey': accessKey})
	.then(user => {
		if (!user) {
			throw new NoUserError(messages.NO_USER);
		}
		return user.update({$set: {'pushToken': req.body.token}})
	})
	.then(() => {
		return commonResponse.ok(res);
	})
	.catch(next);
});

module.exports = router;