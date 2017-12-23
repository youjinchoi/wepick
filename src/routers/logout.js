var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Question = require('../models/question');
var Answer = require('../models/answer');
var commonResponse = require('../commons/commonResponse');
var NoAccessKeyError = require('../errors/NoAccessKeyError');
var NoUserError = require('../errors/NoUserError');
var messages = require('../commons/messages');
var axios = require('axios');
var vars = require('../../config/vars');

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
		
		if (user.type == MEMBER) {	// 일반 유저 로그아웃시 푸시 토큰 삭제
			user.pushToken = null;
			user.save()
			.then(() => {
				commonResponse.ok(res);
			});
		} else if (user.type == GUEST) {	// 게스트 유저 로그아웃시 탈퇴처리
			var userSeq = user.seq;
			console.log('user seq', userSeq);
			user.remove()
			.then(() => {
				axios.delete(vars.api + '/users/remove-history/' + userSeq, {
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
		}
	})
	.catch(next);
});

module.exports = router;