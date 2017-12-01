var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Question = require('../models/question');
var Answer = require('../models/answer');
var crypto = require('crypto');
var getNextSeq = require('../autoIncrement');
var commonResponse = require('../commons/commonResponse');

var MEMBER = 2;

router.get('/@Self', function(req, res) {
	var accessKey = req.get('Access-Key');
	if (!accessKey) {
		commonResponse.noAccessKey(res);
		return;
	}
	User.findOne({'accessKey': accessKey}, function(error, data) {
		if (error || !data) {
			commonResponse.noUser(res);
			return;
		}
		commonResponse.ok(res, data);
	})
})

router.post('/', function(req, res) {
	getNextSeq('user').then(result => {
		var accessKey = crypto.createHash('sha256').update(result.seq.toString()).digest('hex');
		var body = req.body;
		var user = new User();
		user.seq = result.seq;
		user.type = MEMBER;
		user.accessKey = accessKey;
		user.email = body.email;
		user.password = crypto.createHash('sha256').update(body.password).digest('hex');
		user.save(function(error) {
			if (error) {
				console.log(error);
				switch(error.code) {
					case 11000:
						commonResponse.error(res, user.email + " already exists.");
						break;
					default:
						commonResponse.error(res);
						break;
				}
				return;
			}
			commonResponse.ok(res, {accessKey: accessKey});
		});
	});
});

router.delete('/', function(req, res) {
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
			commonResponse.error(res);
			return;
		}
		user.remove(function(error) {
			if (error) {
				commonResponse.error(res);
				return;
			}
			Question.remove({'questioner': user.seq}, function(error) {
				if (error) {
					commonResponse.error(res);
					return;
				}
				Answer.remove({'questioner': user.seq}, function(error) {
					if (error) {
						commonResponse.error(res);
						return;
					}
					commonResponse.ok(res);
				})
			})
		})
	})
});

/*router.get('/validate', function(req, res) {
	var email = req.query.email;
	User.findOne({'email': email}, function(error, user) {
		if (error) {
			commonResponse.error(res);
			return;
		}
		commonResponse.ok(res, {isValid: !user});
	})
})*/

module.exports = router;