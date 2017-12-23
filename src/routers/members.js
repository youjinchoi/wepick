var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Question = require('../models/question');
var Answer = require('../models/answer');
var crypto = require('crypto');
var getNextSeq = require('../autoIncrement');
var commonResponse = require('../commons/commonResponse');
var NotFoundError = require('../errors/NotFoundError');
var DuplicationError = require('../errors/DuplicationError');
var axios = require('axios');
var vars = require('../../config/vars');

var MEMBER = 2;

router.get('/', function(req, res, next) {
	var accessKey = req.get('Access-Key');
	if (!accessKey) {
		commonResponse.noAccessKey(res);
		return;
	}
	
	User.findOne({'accessKey': accessKey})
	.then(user => {
		if (!user) {
			throw new NotFoundError('User not found.');
		}
		commonResponse.ok(res, user);
	})
	.catch(next);
})

router.post('/', function(req, res, next) {
	var body = req.body;
	getNextSeq('user')
	.then(result => {
		return User.findOne({'email': body.email});
	})
	User.findOne({'email': body.email})
	.then(user => {
		if (user) {
			throw new DuplicationError('Email alreay exists.');
		}
		return getNextSeq('user');
	})
	.then(result => {
		var seq = result.seq;
		var accessKey = crypto.createHash('sha256').update(seq.toString()).digest('hex');
		var user = new User();
		user.seq = seq;
		user.type = MEMBER;
		user.accessKey = accessKey;
		user.email = body.email;
		user.password = crypto.createHash('sha256').update(body.password).digest('hex');
		return user.save().then(() => accessKey);
	})
	.then(accessKey => {
		commonResponse.ok(res, {accessKey: accessKey});
	})
	.catch(next);
});

router.delete('/', function(req, res, next) {
	var accessKey = req.get('Access-Key');
	if (!accessKey) {
		commonResponse.noAccessKey(res);
		return;
	}
	User.findOne({'accessKey': accessKey})
	.then(user => {
		if (!user) {
			throw new NotFoundError('User not found.');
		}
		var userSeq = user.seq;
		return user.remove().then(() => userSeq);
	})
	.then(userSeq => {
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
	.catch(next);
});

module.exports = router;