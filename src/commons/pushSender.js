var apn = require('apn');
var vars = require('../../config/vars');
var apnProvider = new apn.Provider(vars.pushOptions);

var pushSender = {};

pushSender.sendMessage = function(token) {
	return apnProvider.send(note, token);
}

pushSender.sendAnswerToQuestioner = function(token, questionSeq, questionContents, answerContents, answerCount) {
	var note = new apn.Notification();
	note.topic = 'com.Waak.WePick';
	note.contentAvailable = 1;
	note.alert = {
		'loc-key': 'push_answer',
		'loc-args': [questionContents, answerContents, answerCount.toString()]
	};
	note.payload = {'questionSeq': questionSeq};
	console.log(note.alert['loc-args'], note.payload);
	return apnProvider.send(note, token);
}

module.exports = pushSender;