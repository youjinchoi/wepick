var express = require('express');
var questions = express.Router();
var User = require('../models/user');
var Question = require('../models/question');
var getNextSeq = require('../autoIncrement');

questions.get('/', function(req, res) {
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
}

questions.post('/', function(req, res){
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
		var body = req.body;
		var question = new Question();
		question.seq = getNextSeq('question');
		getNextSeq('question').then(result => {
			var question = new Question();
			question.seq = result.seq;
			question.questioner = user.seq;
			question.contents = body.contents;
			question.options = body.options;
			question.save(function(error) {
				if (error) {
					res.status(500).json({
						status: "ERROR"
					})
					return;
				}
				res.json({status: "OK"});
			});
		});
	})
});

questions.delete('/:questionSeq', function(req, res) {
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
});

module.exports = questions;