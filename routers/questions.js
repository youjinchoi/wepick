var express = require('express');
var questions = express.Router();
var User = require('../models/user');
var Question = require('../models/question');
var Answer = require('../models/answer');
var getNextSeq = require('../autoIncrement');
var commonResponse = require('../commons/commonResponse');

questions.get('/', function(req, res) {
	var accessKey = req.get('Access-Key');
	if (req.query.type == 'guest' || !accessKey) {
		questions.listForGuestUser(req, res);
		return;
	}
	User.findOne({'accessKey': accessKey}, function(error, user) {
		if (error || !user) {
			questions.listForGuestUser(req, res);
			return;
		}
		if (req.query.type == 'my') {
			questions.listForMy(req, res, user);
			return;
		} else {
			questions.listForLoginUser(req, res, user);
			return;
		}
	});
});

// 모든 질문 목록(비로그인시)
questions.listForGuestUser = function(req, res) {
	var count = req.query.count || 20;
	var paging = req.query.next ? {'seq': {$lt: req.query.next}, 'isClosed': false} : {'isClosed': false};
	Question.find(paging).sort({'seq': -1}).limit(count).exec(function(error, questions){
		commonResponse.ok(res,
			{
				next: (!questions || questions.length == 0) ? null : questions[questions.length-1].seq,
				list: questions
			}
		);
	});
}

// 내가 등록하거나 답변한 질문을 제외한 진행중인 질문 목록(로그인시)
questions.listForLoginUser = function(req, res, user) {
	var count = req.query.count || 20;
	var pagingForAnswer = req.query.next ? {'question': {$lt: req.query.next}, 'answerer': user.seq} : {'answerer': user.seq};
	Answer.find(pagingForAnswer).sort({'question': -1}).limit(count).exec(function(error, answers) {
		//console.log(answers);
		var answeredQuestions = (answers || []).map((answer) => {
			return answer.question;
		});
		//console.log('answeredQuestions', answeredQuestions);
		var pagingForQuestion = req.query.next ? {'seq': {$lt: req.query.next, $nin: answeredQuestions}, 'questioner': {$ne: user.seq}, 'isClosed': false} : {'seq': {$nin: answeredQuestions}, 'questioner': {$ne: user.seq}, 'isClosed': false};
		Question.find(pagingForQuestion).sort({'seq': -1}).limit(count).exec(function(error, questions){
			commonResponse.ok(res,
				{
					next: (!questions || questions.length == 0) ? null : questions[questions.length-1].seq,
					list: questions
				}
			);
		});
	});
}

// 내가 등록한 질문 목록
questions.listForMy = function(req, res, user) {
	var count = req.query.count || 20;
	var paging = req.query.next ? {'seq': {$lt: req.query.next}, 'questioner': user.seq} : {'questioner': user.seq};
	Question.find(paging).sort({'seq': -1}).limit(count).exec(function(error, questions){
		commonResponse.ok(res,
			{
				next: (!questions || questions.length == 0) ? null : questions[questions.length-1].seq,
				list: questions
			}
		);
	});
}

questions.post('/', function(req, res){
	var accessKey = req.get('Access-Key');
	if (!accessKey) {
		commonResponse.noAccessKey(res);
		return;
	}
	User.findOne({'accessKey': accessKey}, function(error, user) {
		if (error) {
			commonResponse.error(res);
			return;
		}
		if (!user) {
			commonResponse.noUser(res);
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
			question.maxAnswerCount = body.maxAnswerCount;
			var options = (body.options || []).map(option => {
				return {
					value: option,
					count: 0
				}
			})
			question.options = options;
			question.save(function(error) {
				if (error) {
					commonResponse.error(res);
					return;
				}
				commonResponse.ok(res);
			});
		});
	})
});

questions.delete('/:questionSeq', function(req, res) {
	var accessKey = req.get('Access-Key');
	if (!accessKey) {
		commonResponse.noAccessKey(res);
		return;
	}
	User.findOne({'accessKey': accessKey}, function(error, user) {
		if (error) {
			commonResponse.error(res);
			return;
		}
		if (!user) {
			commonResponse.noUser(res);
			return;
		}
		Question.remove({seq: req.params.questionSeq, 'questioner': user.seq}, function(error){
			if (error) {
				commonResponse.error(res);
				return;
			}
			commonResponse.ok(res);
		});
	});
});

questions.patch('/close/:questionSeq', function(req, res) {
	var accessKey = req.get('Access-Key');
	if (!accessKey) {
		commonResponse.noAccessKey(res);
		return;
	}
	User.findOne({'accessKey': accessKey}, function(error, user) {
		if (error) {
			commonResponse.error(res);
			return;
		}
		if (!user) {
			commonResponse.noUser(res);
			return;
		}
		Question.update({seq: req.params.questionSeq, 'questioner': user.seq}, {$set: {'isClosed': true}}, function(error){
			if (error) {
				commonResponse.error(res);
				return;
			}
			commonResponse.ok(res);
		});
	});
});

module.exports = questions;