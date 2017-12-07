var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Question = require('../models/question');
var Answer = require('../models/answer');
var getNextSeq = require('../autoIncrement');
var commonResponse = require('../commons/commonResponse');

var filterObject = function(question) {
	if (!question) {
		return null;
	}
	var temp = question.toObject();
	delete temp._id;
	delete temp.__v;
	delete temp.answerers;
	temp.createDate = temp.createDate.getTime();
	return temp;
}

var filterList = function(questions) {
	if (!questions || questions.length == 0) {
		return [];
	}
	return questions.map(question => {
		return filterObject(question);
	})
}

router.get('/', function(req, res, next) {
	var accessKey = req.get('Access-Key');
	if (req.query.type == 'guest' || !accessKey) {
		router.listForGuestUser(req, res);
		return;
	}
	User.findOne({'accessKey': accessKey}, function(error, user) {
		if (error || !user) {
			router.listForGuestUser(req, res, next);
			return;
		}
		if (req.query.type == 'my') {
			router.listForMy(req, res, user, next);
			return;
		} else {
			router.listForLoginUser(req, res, user, next);
			return;
		}
	});
});

// 모든 질문 목록(비로그인시)
router.listForGuestUser = function(req, res) {
	var count = req.query.count || 20;
	var paging = req.query.next ? {'seq': {$lt: req.query.next}, 'isClosed': false} : {'isClosed': false};
	Question.find(paging).sort({'seq': -1}).limit(count).exec(function(error, questions){
		var filtered = filterList(questions);
		console.log(filtered);
		commonResponse.ok(res,
			{
				next: (!filtered || filtered.length == 0) ? null : filtered[filtered.length-1].seq,
				list: filtered
			}
		);
	});
}

// 내가 등록하거나 답변한 질문을 제외한 진행중인 질문 목록(로그인시)
router.listForLoginUser = function(req, res, user, next) {
	var count = req.query.count || 20;
	var query = req.query.next ? { 'seq': { $lt: req.query.next }, 'questioner' : { $ne: user.seq }, 'answerers': { $nin: [user.seq] } } : { 'questioner' : { $ne: user.seq }, 'answerers': { $nin: [user.seq] } };
	Question.find(query).sort({'seq': -1}).limit(count)
	.then(questions => {
		var filtered = filterList(questions);
		commonResponse.ok(res,
			{
				next: (!filtered || filtered.length == 0) ? null : filtered[filtered.length-1].seq,
				list: filtered
			}
		);
	})
	.catch(next);
}

// 내가 등록한 질문 목록
router.listForMy = function(req, res, user) {
	var count = req.query.count || 20;
	var paging = req.query.next ? {'seq': {$lt: req.query.next}, 'questioner': user.seq} : {'questioner': user.seq};
	Question.find(paging).sort({'seq': -1}).limit(count).exec(function(error, questions){
		var filtered = filterList(questions);
		commonResponse.ok(res,
			{
				next: (!filtered || filtered.length == 0) ? null : filtered[filtered.length-1].seq,
				list: filtered
			}
		);
	});
}



router.post('/', function(req, res){
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
				commonResponse.ok(res, filterObject(question));
			});
		});
	})
});

router.delete('/:questionSeq', function(req, res) {
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
			Answer.remove({'question': req.params.questionSeq}, function(error) {
				if (error) {
					commonResponse.error(res);
					return;
				}
				commonResponse.ok(res);
			})
		});
	});
});

router.patch('/close/:questionSeq', function(req, res) {
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

var SKIPPED = 0;
router.post('/skip/:questionSeq', function(req, res) {
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
		Question.findOne({seq: req.params.questionSeq}, function(error, question){
			if (error) {
				commonResponse.error(res);
				return;
			}
			var answer = new Answer();
			answer.question = question.seq;
			answer.answerer = user.seq;
			answer.questioner = question.questioner;
			answer.type = SKIPPED;
			answer.save(function(error) {
				if (error) {
					commonResponse.error(res);
					return;
				}
				commonResponse.ok(res);
			})
		});
	});
});

module.exports = router;