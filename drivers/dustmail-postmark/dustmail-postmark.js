var _ = require('underscore');
module.exports = function(key) {
	var postmark = require('postmark')(key);
	return function(emailData, callback) {
		var sendData = {
			To: emailData.to,
			From: emailData.from,
			Subject: emailData.subject,
			HtmlBody: emailData.render.HtmlBody,
			TextBody: emailData.render.TextBody
		};
		var attachments = [];
		if(emailData.attachments) {
			_.each(emailData.attachments, function(attachment) {
				attachments.push({
					Name: attachment.name,
					Content: new Buffer(attachment.content).toString('base64'), // postmark wants a base64 encoded string
					ContentType: attachment.contentType
				});
			});
			sendData.Attachments = attachments;
		}
		if(!sendData.HtmlBody && !sendData.TextBody) {
			return callback({message: 'Neither TextBody or HtmlBody set. Email can not be sent'});
		}
		postmark(key).send(sendData, function(err, result) {
			if(err) {
				callback({message: 'Email failed to send', raw: err});
			}else{
				callback(null,result);
			}
		});
	}
}