dustmail.js
=====

    npm install dustmail


Dustmail is a simple email module designed to leverage dust templates for sending emails out. This module allows you to create templates like many developers have grown to expect with an express server, complete with layouts and partials.

Dustmail is also designed to allow you to use whatever email sending server you are most comfortable with by providing a simple and easy to use driver system. We've included two drivers for popular mail services Postmark and Mandrill. Both drivers are separate from Dustmail and can be installed via npm.


Code Examples
-------------
```javascript
var	dustmail = require('dustmail')(),
	postmark = require('dustmail-postmark')('postmark_api_key');


var data = {
	template: 'test',
	vars: {
		name: 'Mr. Example'
	},
	to: 'example@example.com',
	from: 'example@example.com',
	subject: 'Dustmail is awesome!',
	attachments: [ // array of objects
		{
			name: 'readme.txt',
			content: 'Hello World!', // full content of the file
			contentType: 'text/plain'
		}
	]
}
dustmail.driver(postmark); // set our driver to postmark, as defined above

// This example demos use of rendering template first, and passing that directly to send.
// It only sends plain text, as specified via the sendType
// This could allow you to use the generated HTML/Plaintext to save or manipulate further as you choose.
dustmail.render(data.template, data.vars, function(err, renderData) {
	if(err) {
		res.fail(err);
	}else{
		dustmail.send({
			to: data.to,
			from: data.from,
			subject: data.subject,
			attachments: data.attachments,
			render: renderData,
			sendType: 'html',
		}, function(err, data) {
			if(err) {
				console.log(err);
			}else{
				console.log(data);
			}
		});
	}
});

// This example simply sends an email using the template and variables specified.
// It only sends html, as specified via the sendType
// Rendering the template HTML is handled internally.
dustmail.send({
	to: data.to,
	from: data.from,
	subject: data.subject +'manual send',
	attachments: data.attachments,
	template: data.template,
	vars: data.vars,
	sendType: 'html',
}, function(err, data) {
	if(err) {
		console.log(err);
	}else{
		console.log(data);
	}
});
```
Errors
------
Errors are generally returned in the following format. 'raw' is sometimes not included where not applicable.
```javascript
{
	message: 'Friendly message',
	raw: 'raw, technical message'
}
```
Drivers
-------
Writing an email driver for dustmail.js is extremely simple. The driver is just a basic function to handle the email being sent. See [our documentation](https://github.com/nodecraft/dustmail.js/wiki/Creating-a-dustmail-driver) for more information on writing your own.

