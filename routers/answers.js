var express = require('express');
var answers = express.Router();
var User = require('../models/user');
var Question = require('../models/question');
var Answer = require('../models/answer');
var commonResponse = require('../commons/commonResponse');

answers.post('/', function(req, res){
	var accessKey = req.get('Access-Key');
	if (!accessKey) {
		commonResponse.noAccessKey(res);
		return;
	}
	User.findOne({'accessKey': accessKey}, function(error, user) {
		if (error) {
			commonResponse.Error(res);
			return;
		}
		if (!user) {
			commonResponse.noUser(res);
			return;
		}
		var answer = new Answer();
		answer.question = req.body.question;
		answer.answerer = user.seq;
		answer.selection = req.body.selection;
		answer.save(function(error) {
			if (error) {
				commonResponse.Error(res);
				return;
			}
			Question.findOneAndUpdate(
				{seq: req.body.question},
				{ $inc: { answerCount: 1 } },
				{ new: true },
				function(error, question) {
					if (error) {
						commonResponse.Error(res);
						return;
					}

					if (question.answerCount == question.maxAnswerCount) {
						question.update({isClosed: true}, function(error) {
							if (error) {
								commonResponse.Error(res);
								return;
							}
							commonResponse.Ok(res);
							return ;
						})
					} else {
						commonResponse.Ok(res);
						return ;
					}
				}
			)
		});
	})
});

module.exports = answers;