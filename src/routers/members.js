var express = require('express');
var router = express.Router();
var User = require('../models/user');
var crypto = require('crypto');
var commonResponse = require('../commons/commonResponse');
var NoAccessKeyError = require('../errors/NoAccessKeyError');
var NoUserError = require('../errors/NoUserError');
var NotFoundError = require('../errors/NotFoundError');
var DuplicationError = require('../errors/DuplicationError');
var axios = require('axios');
var vars = require('../../config/vars');

var MEMBER = 2;

router.get('/', function(req, res, next) {
	var accessKey = req.get('Access-Key');
	if (!accessKey) {
		throw new NoAccessKeyError();
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
	var accessKey = req.get('Access-Key');
	if (!accessKey) {
		throw new NoAccessKeyError();
	}

	var email = req.body.email;
	User.findOne({'email': email})
	.then(user => {
		if (user) {
			throw new DuplicationError('Email alreay exists.');
		}
		return User.findOne({'accessKey': accessKey});
	})
	.then(user => {
		var password = crypto.createHash('sha256').update(req.body.password).digest('hex');
		return User.findByIdAndUpdate(user.id, {$set: {'type': MEMBER, 'email': email, 'password': password}});
	})
	.then(() => {
		commonResponse.ok(res);
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