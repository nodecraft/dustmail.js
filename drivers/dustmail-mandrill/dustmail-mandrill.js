var mandrill = require('mandrill-api/mandrill'),
	_ = require('underscore');
module.exports = function(key) {
	mandrill_client = new mandrill.Mandrill(key);
	return function(emailData, callback) {
		var sendData = {
			to: [{ email: emailData.to }],
			from_email: emailData.from,
			subject: emailData.subject,
			html: emailData.render.HtmlBody,
			text: emailData.render.TextBody
		};
		var attachments = [];
		if(emailData.attachments) {
			_.each(emailData.attachments, function(attachment) {
				attachments.push({
					name: attachment.name,
					content: new Buffer(attachment.content).toString('base64'), // mandrill wants a base64 encoded string
					type: attachment.contentType
				});
			});
			sendData.Attachments = attachments;
		}
		mandrill_client.messages.send({message: sendData}, function(result) {
			callback(null,result);
		}, function(err) {
			callback({message: 'Email failed to send', raw: err});
		});
	}
}