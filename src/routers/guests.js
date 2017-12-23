var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Question = require('../models/question');
var Answer = require('../models/answer');
var crypto = require('crypto');
var getNextSeq = require('../autoIncrement');
var commonResponse = require('../commons/commonResponse');
var axios = require('axios');
var vars = require('../../config/vars');
var NoUserError = require('../errors/NoUserError');

var GUEST = 1;

router.post('/', function(req, res, next) {
	getNextSeq('user')
	.then(result => {
		var accessKey = crypto.createHash('sha256').update(result.seq.toString()).digest('hex');
		var user = new User();
		user.seq = result.seq;
		user.type = GUEST;
		user.accessKey = accessKey;
		return user.save();
	})
	.then(user => {
		commonResponse.ok(res, {accessKey: user.accessKey});
	})
	.catch(next);
});

module.exports = router;