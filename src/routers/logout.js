var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Question = require('../models/question');
var Answer = require('../models/answer');
var commonResponse = require('../commons/commonResponse');
var NoAccessKeyError = require('../errors/NoAccessKeyError');
var NoUserError = require('../errors/NoUserError');
var messages = require('../commons/messages');


var GUEST = 1;
var MEMBER = 2;

router.post('/', function(req, res, next) {
	var accessKey = req.get('Access-Key');
	if (!accessKey) {
		throw new NoAccessKeyError(messages.NO_ACCESS_KEY);
	}
	User.findOne({'accessKey': accessKey})
	.then(user => {
		if (!user) {
			throw new NoUserError(messages.NO_USER);
		}
		
		// 일반 유저 로그아웃시 푸시 토큰 삭제
		if (user.type == MEMBER) {
			user.pushToken = null;
			user.save().then(() => commonResponse.ok(res));
		} else if (user.type == GUEST) {	// 게스트 유저 로그아웃시 탈퇴처리
			user.remove()
			.then(() => {
				return Question.remove({'questioner': user.seq});
			})
			.then(() => {
				return Answer.remove({'questioner': user.seq});
			})
			.then(() => {
				commonResponse.ok(res);
			});
		}
	})
	.catch(next);
});

module.exports = router;