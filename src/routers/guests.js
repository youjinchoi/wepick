var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Question = require('../models/question');
var Answer = require('../models/answer');
var crypto = require('crypto');
var getNextSeq = require('../autoIncrement');
var commonResponse = require('../commons/commonResponse');

var GUEST = 1;

router.post('/', function(req, res) {
	getNextSeq('user').then(result => {
		var accessKey = crypto.createHash('sha256').update(result.seq.toString()).digest('hex');
		var user = new User();
		user.seq = result.seq;
		user.type = GUEST;
		user.accessKey = accessKey;
		user.save(function(error) {
			if (error) {
				console.error(error);
				commonResponse.error(res);
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
			commonResponse.noUser(res);
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
		});
	});
});

module.exports = router;