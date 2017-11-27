var express = require('express');
var answers = express.Router();
var User = require('../models/user');
var Question = require('../models/question');
var Answer = require('../models/answer');
var getNextSeq = require('../autoIncrement');
var apiResponse = require('../common/apiResponse');

/*questions.get('/', function(req, res) {
	if (req.query.type == 'my') {
		questions.myList(req, res);
		return;
	}
	Question.find(function(error, questions){
        var apiResponse = {
            status: "OK",
            result: questions
        };
        res.json(apiResponse);
    });      
});

questions.myList = function(req, res) {
	var accessKey = req.get('Access-Key');
	if (!accessKey) {
		res.status(401).json({
			status: "ERROR",
			result: "Access-Key in header is required."
		})
		return;
	}
	User.findOne({'accessKey': accessKey}, function(error, user) {
		if (error) {
			apiResponse.accessKeyRequired(res);
			res.status(500).json({
				status: "ERROR"
			})
			return;
		}
		Question.find({'questioner': user.seq}, function(error, questions){
			console.log(questions);
			var apiResponse = {
				status: "OK",
				result: questions
			};
			res.json(apiResponse);
		});
	});
}*/

answers.post('/', function(req, res){
	var accessKey = req.get('Access-Key');
	if (!accessKey) {
		apiResponse.accessKeyRequired(res);
		/*res.status(401).json({
			status: "ERROR",
			result: "Access-Key in header is required."
		})*/
		return;
	}
	User.findOne({'accessKey': accessKey}, function(error, user) {
		if (error) {
			res.status(500).json({
				status: "ERROR"
			})
			return;
		}
		if (!user) {
			res.status(401).json({
				status: "ERROR",
				result: "user does not exist."
			})
			return;
		}
		var answer = new Answer();
		answer.question = req.body.question;
		answer.answerer = user.seq;
		answer.selection = req.body.selection;
		answer.save(function(error) {
			if (error) {
				res.status(500).json({
					status: "ERROR"
				})
				return;
			}
			Question.findOneAndUpdate(
				{seq: req.body.question},
				{ $inc: { answerCount: 1 } },
				{ new: true },
				function(error, question) {
					if (error) {
						res.json({status: "ERROR"});
					}

					if (question.answerCount == question.maxAnswerCount) {
						question.update({isClosed: true}, function(error) {
							if (error) {}
							res.json({status: "OK"});
							return ;
						})
					} else {
						res.json({status: "OK"});
						return ;
					}
				}
			)
		});
	})
});

/*questions.delete('/:questionSeq', function(req, res) {
	var accessKey = req.get('Access-Key');
	if (!accessKey) {
		res.status(401).json({
			status: "ERROR",
			result: "Access-Key in header is required."
		})
		return;
	}
	User.findOne({'accessKey': accessKey}, function(error, user) {
		if (error) {
			res.status(500).json({
				status: "ERROR"
			})
			return;
		}
		if (!user) {
			res.status(401).json({
				status: "ERROR",
				result: "user does not exist."
			})
			return;
		}
		Question.remove({seq: req.params.questionSeq, 'questioner': user.seq}, function(error){
			if (error) {
				console.log(error);
				res.status(500);
				res.json({
					status: "ERROR"
				});

			}
			res.json({
				status: "OK"
			});
		});
	});
});*/

module.exports = answers;