var apn = require('apn');
var vars = require('../../config/vars');
var note = new apn.Notification();
note.alert = {'loc-key' : 'test_loc_key', 'loc-args' : 'test_loc_args'};
note.topic = 'com.Waak.WePick';
note.contentAvailable = 1;

var apnProvider = new apn.Provider(vars.pushOptions);

var pushSender = {};

pushSender.sendMessage = function(token) {
	return apnProvider.send(note, token);
}

pushSender.sendAnswerToQuestioner = function(token, questionContents, answerContents, answerCount) {
	console.log('pushInfo', token, questionContents, answerContents, answerCount);
	note.alert = {
		'loc-key': 'push_answer',
		'loc-args': [questionContents, answerContents, answerCount.toString()]
	};
	return apnProvider.send(note, token);
}

module.exports = pushSender;