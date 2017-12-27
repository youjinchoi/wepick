var express = require('express');
var answers = express.Router();
var User = require('../models/user');
var Question = require('../models/question');
var Answer = require('../models/answer');
var commonResponse = require('../commons/commonResponse');
var NoAccessKeyError = require('../errors/NoAccessKeyError');
var NoUserError = require('../errors/NoUserError');
var NotFoundError = require('../errors/NotFoundError');
var InvalidParameterError = require('../errors/InvalidParameterError');
var messages = require('../commons/messages');
var pushSender = require('../commons/pushSender');
var axios = require('axios');
var vars = require('../../config/vars');


answers.post('/', function(req, res, next){
	var accessKey = req.get('Access-Key');
	if (!accessKey) {
		throw new NoAccessKeyError(messages.NO_ACCESS_KEY);
	}
	User.findOne({'accessKey': accessKey})
	.then(user => {
		if (!user) {
			throw new NoUserError(messages.NO_USER);
		}
		return Question.findOne({'seq': req.body.question}).then(question => {
			if (!question) {
				throw new NotFoundError('Question not found.');
			}

			if (question.isClosed || question.maxAnswerCount == question.answerCount) {
				throw new Error('Question already closed.');
			}
			return { question: question, user: user }
		});
	})
	.then(data => {
		data.question.answerers.map(answerer => {
			if (answerer == data.user.seq) {
				throw Error(messages.ALREADY_ANSWERED);
			}
		});
		
		if (!data.question.options[req.body.selection]) {
			throw InvalidParameterError(messages.INVALID_SELECTION);
		}
		var answer = new Answer();
		answer.question = data.question.seq;
		answer.questioner = data.question.questioner;
		answer.answerer = data.user.seq;
		answer.selection = req.body.selection;
		return answer.save().then(() => {
			return { answer: answer, user: data.user, question: data.question }
		});
	})
	.then(data => {
		var question = data.question;
		var increase = {};
		increase["answerCount"] = 1;
		increase["options." + data.answer.selection + ".count"] = 1;
		var updateInfo = {
				$inc: increase,
				$push: { answerers: data.user.seq }
			};
		if (question.maxAnswerCount - question.answerCount <= 1) {
			updateInfo.isClosed = true;
		}
		return Question.findOneAndUpdate({seq: question.seq}, updateInfo, {new: true}).then(question => question);
	})
	.then(question => {
		axios.post(vars.api + '/pushes', {
		    questionSeq: question.seq,
		    selection: req.body.selection
		}, {
			headers: {'Server-Key': vars.serverKey}
		})
		.then(function (res) {
		    // do nothing
		})
		.catch(function (error) {
		    // do nothing
		});
		commonResponse.ok(res);
	})
	.catch(next);
});

module.exports = answers;