var express = require('express');
var answers = express.Router();
var User = require('../models/user');
var Question = require('../models/question');
var Answer = require('../models/answer');
var commonResponse = require('../commons/commonResponse');
var NoAccessKeyError = require('../errors/NoAccessKeyError');
var NoUserError = require('../errors/NoUserError');
var messages = require('../commons/messages');
var pushSender = require('../commons/pushSender');


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
			return { question: question, user: user }
		});
	})
	.then(data => {
		data.question.answerers.map(answerer => {
			if (answerer == data.user.seq) {
				throw Error(messages.ALREADY_ANSWERED);
			}
		})
		var answer = new Answer();
		answer.question = data.question.seq;
		answer.questioner = data.question.questioner;
		answer.answerer = data.user.seq;
		answer.selection = req.body.selection;
		return answer.save().then(() => {
			return { answer: answer, user: data.user }
		});
	})
	.then(data => {
		var increase = {};
		increase["answerCount"] = 1;
		increase["options." + data.answer.selection + ".count"] = 1;
		return Question.findOneAndUpdate(
					{ seq: req.body.question },
					{ $inc: increase, $push: { answerers: data.user.seq } },
					{ new: true }
				);
	})
	.then(question => {
		if (question.answerCount == question.maxAnswerCount) {
			question.update({ isClosed: true }).then(() => {
				return User.findOne({'seq': question.questioner}).then(user => {
					return {question: question, questioner: user}
				});
			});
		} else {
			return User.findOne({'seq': question.questioner}).then(user => {
				return {question: question, questioner: user}
			});
		}
	})
	.then(data => {
		var questioner = data.questioner;
		if (questioner && questioner.pushToken) {
			var question = data.question;
			pushSender.sendAnswerToQuestioner(questioner.pushToken, question.contents, question.options[req.body.selection].value, question.answerCount)
			.then(result => {
				console.log(result);
				commonResponse.ok(res);
			})
		} else {
			commonResponse.ok(res);
		}
	})
	.catch(next);
});

module.exports = answers;