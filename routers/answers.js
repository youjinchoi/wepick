var express = require('express');
var answers = express.Router();
var User = require('../models/user');
var Question = require('../models/question');
var Answer = require('../models/answer');
var commonResponse = require('../commons/commonResponse');
var NoAccessKeyError = require('../errors/NoAccessKeyError');
var NoUserError = require('../errors/NoUserError');
var messages = require('../commons/messages');

var ANSWERED = 1;

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
		return Question.findOne({'seq': req.body.question}).then(question => {return {question:question, user:user}});
	})
	.then(data => {
		console.log(data);
		var answer = new Answer();
		answer.question = data.question.seq;
		answer.questioner = data.question.questioner;
		answer.answerer = data.user.seq;
		answer.selection = req.body.selection;
		return answer.save().then(() => answer);
	})
	.then(user => {
		var increase = {};
		increase["answerCount"] = 1;
		increase["options." + answer.selection + ".count"] = 1;
		return Question.findOneAndUpdate(
					{ seq: req.body.question },
					{ $inc: increase },
					{ new: true }
				);
	})
	.then(question => {
		if (question.answerCount == question.maxAnswerCount) {
			 return question.update({isClosed: true}, function(error) {
			})
		} else {
			return commonResponse.ok(res);
		}
	})
	.then(() => {
		return commonResponse.ok(res);
	})
	.catch(next);
});

module.exports = answers;