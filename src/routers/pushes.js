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

var getTopAnswer = function(options) {
	var topCount = 0;
	options.map(data => {
		if (data.count > topCount) {
			topCount = data.count;
		}
	})
	var topAnswer = {
		count: topCount,
		contents: null
	}
	options.map(data => {
		if (data.count == topCount) {
			topAnswer.contents = !topAnswer.contents ? data.value : (topAnswer.contents + ", " + data.value)
		}
	})
	return topAnswer;
}

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
			return {questioner: user, question: question};
		})
	})
	.then(data => {
		if (!data.questioner) {
			throw new NotFoundError('Questioner not found.');
		}
		var questioner = data.questioner;
		if (!questioner.pushToken) {
			commonResponse.ok(res);
		}
		
		var question = data.question;
		var topAnswer = getTopAnswer(question.options);
		if (question.isClosed) {
			pushSender.sendFinalAnswerToQuestioner(questioner.pushToken, {
				questionSeq:question.seq,
				questionContents:question.contents.replace(/\n/gi," "),
				maxAnswerCount: question.maxAnswerCount,
				topAnswerContents: topAnswer.contents,
				topAnswerCount: topAnswer.count,
			}, function() {
				commonResponse.ok(res);
			}, function() {
				var errorMessage = 'Push message send fail.';
				console.error(errorMessage)
				commonResponse.error(res, errorMessage);
			})

		} else {
			pushSender.sendAnswerToQuestioner(questioner.pushToken, {
				questionSeq:question.seq,
				questionContents:question.contents.replace(/\n/gi," "),
				answerContents: question.options[selection].value,
				answerCount: question.answerCount,
				topAnswerCount: topAnswer.count,
				topAnswerContents: topAnswer.contents
			}, function() {
				commonResponse.ok(res);
			}, function() {
				var errorMessage = 'Push message send fail.';
				console.error(errorMessage)
				commonResponse.error(res, errorMessage);
			})
		}
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