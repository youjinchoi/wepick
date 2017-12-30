var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Question = require('../models/question');
var Answer = require('../models/answer');
var Skip = require('../models/skip');
var getNextSeq = require('../autoIncrement');
var commonResponse = require('../commons/commonResponse');
var NoUserError = require('../errors/NoUserError');
var NoAccessKeyError = require('../errors/NoAccessKeyError');

var filterObject = function(question) {
	if (!question) {
		return null;
	}
	var temp = question.toObject();
	delete temp._id;
	delete temp.__v;
	delete temp.answerers;
	delete temp.skipUsers;
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
	if (accessKey) {
		if (req.query.type == 'my') {
			router.listForMy(req, res, next, accessKey);
		} else {
			router.listForLoginUser(req, res, next, accessKey);
		}
	} else {
		router.listForGuestUser(req, res, next);
	}
});

// 모든 질문 목록(비로그인시)
router.listForGuestUser = function(req, res, next) {
	var count = req.query.count || 20;
	var paging = req.query.next ? {'seq': {$lt: req.query.next}} : {};
	Question.find(paging).sort({'seq': -1}).limit(count)
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

// 내가 등록하거나 답변한 질문을 제외한 진행중인 질문 목록(로그인시)
router.listForLoginUser = function(req, res, next, accessKey) {
	User.findOne({'accessKey': accessKey})
	.then(user => {
		if (!user) {
			throw new NoUserError();
		}
		var count = req.query.count || 20;
		var query = { 'isClosed': false, 'questioner' : { $ne: user.seq }, 'answerers': { $nin: [user.seq] }, 'skipUsers': { $nin: [user.seq] } };
		if (req.query.next) {
			query['seq'] = { $gt: req.query.next };
		}
		return Question.find(query).sort({'seq': 1}).limit(count);
	})
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
router.listForMy = function(req, res, next, accessKey) {
	User.findOne({'accessKey': accessKey})
	.then(user => {
		if (!user) {
			throw new NoUserError();
		}
		var count = req.query.count || 20;
		var query = { 'questioner': user.seq };
		if (req.query.next) {
			query['seq'] = { $lt: req.query.next };
		}
		return Question.find(query).sort({'seq': -1}).limit(count);
	})
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

router.post('/', function(req, res, next){
	var accessKey = req.get('Access-Key');
	if (!accessKey) {
		throw new NoAccessKeyError();
	}
	User.findOne({'accessKey': accessKey})
	.then(user => {
		if (!user) {
			throw new NoUserError();
		}
		var question = new Question();
		question.seq = getNextSeq('question');
		return getNextSeq('question').then(result => {
			return {result: result, user: user};
		});
	})
	.then(data => {
		var result = data.result;
		if (!result || !result.seq) {
			throw new Error();
		}
		var user = data.user;
		var body = req.body;
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
		return question.save();
	})
	.then(question => {
		commonResponse.ok(res, filterObject(question));
	})
	.catch(next);
});

router.get('/:questionSeq', function(req, res, next) {
	var accessKey = req.get('Access-Key');
	if (!accessKey) {
		throw new NoAccessKeyError();
	}
	User.findOne({'accessKey': accessKey})
	.then(user => {
		if (!user) {
			throw new NoUserError();
		}
		return Question.findOne({'seq': req.params.questionSeq});
	})
	.then(question => {
		if (!question) {
			throw new Error('Question not found.');
		}
		commonResponse.ok(res, filterObject(question));
	})
	.catch(next);
});

router.delete('/:questionSeq', function(req, res, next) {
	var accessKey = req.get('Access-Key');
	if (!accessKey) {
		throw new NoAccessKeyError();
	}
	User.findOne({'accessKey': accessKey})
	.then(user => {
		if (!user) {
			throw new NoUserError();
		}
		return Question.remove({seq: req.params.questionSeq, 'questioner': user.seq});
	})
	.then(() => {
		return Answer.remove({'question': req.params.questionSeq});
	})
	.then(() => {
		commonResponse.ok(res);
	})
	.catch(next);
});

router.patch('/close/:questionSeq', function(req, res, next) {
	var accessKey = req.get('Access-Key');
	if (!accessKey) {
		throw new NoAccessKeyError();
	}
	User.findOne({'accessKey': accessKey})
	.then(user => {
		if (!user) {
			throw new NoUserError();
		}
		return Question.update({seq: req.params.questionSeq, 'questioner': user.seq}, {$set: {'isClosed': true}});
	})
	.then(() => {
		commonResponse.ok(res);
	})
	.catch(next);
});

router.post('/skip/:questionSeq', function(req, res, next) {
	var accessKey = req.get('Access-Key');
	if (!accessKey) {
		throw new NoAccessKeyError();
	}
	var questionSeq = req.params.questionSeq;
	User.findOne({'accessKey': accessKey})
	.then(user => {
		if (!user) {
			throw new NoUserError();
		}
		return Question.findOne({seq: questionSeq}).then(question => {
			return {question: question, user: user};
		});
	})
	.then(data => {
		var question = data.question;
		if (!question) {
			throw new Error('Question not found.');
		}
		var user = data.user;
		var skip = new Skip();
		skip.question = questionSeq;
		skip.skipUser = user.seq;
		skip.questioner = question.questioner;
		return skip.save().then(() => user);
	})
	.then(user => {
		var updateInfo = {
			$push: { skipUsers: user.seq }
		};
		return Question.findOneAndUpdate({seq: questionSeq}, updateInfo, {new: true});
	})
	.then(() => {
		commonResponse.ok(res);
	})
	.catch(next);
});

module.exports = router;