var apn = require('apn');
var vars = require('../../config/vars');
var apnProvider = new apn.Provider(vars.pushOptions);

var pushSender = {};

pushSender.sendMessage = function(token) {
	return apnProvider.send(note, token);
}

pushSender.sendAnswerToQuestioner = function(token, questionSeq, questionContents, answerContents, answerCount) {
	var noti = new apn.Notification();
	noti.topic = 'com.Waak.WePick';
	noti.contentAvailable = 1;
	noti.setLocKey('push_answer');
	noti.setLocArgs([questionContents.replace('\n', ' '), answerContents, answerCount.toString()]);
	noti.payload = {'questionSeq': questionSeq};
	return apnProvider.send(noti, token);
}

module.exports = pushSender;