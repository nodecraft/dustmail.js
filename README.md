dustmail.js
=====

    npm install dustmail


dustmail.js - Email moduled powered by the template engine known as [Dust](https://github.com/linkedin/dustjs/wiki/Dust-Tutorial) and allowing for extremely simple extensions with the use of drivers.

Two examples drivers are included for a couple popular API based mail services known as [Postmark](https://postmarkapp.com) and [Mandrill](http://mandrill.com/). These are simply examples to demonstrate the power of drivers, but likely shouldn't be used in a production environment.


Code Examples
-------------
```javascript
  var	dustmail = require('./dustmail')(),
	postmark = require('./drivers/postmark')('postmark_api_key');


  var data = {
	  template: 'test',
	  vars: {
		name: 'James'
  	},
  	to: 'james@getnodecraft.net',
  	from: 'support@nodecraft.com',
  	subject: 'Dustmail is awesome!',
  }
  dustmail.driver(postmark); // set our driver to postmark, as defined above
  
  // This example demos use of rendering template first, and passing that directly to send.
  // This could allow you to use the generated HTML/Plaintext to save or manipulate further as you choose.
  dustmail.render(data.template, data.vars, function(err, renderData) {
  	if(err) {
  		res.fail(err);
  	}else{
  		dustmail.send({
  			to: data.to,
  			from: data.from,
  			subject: data.subject,
  			render: renderData
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
  // Rendering the template HTML/Plaintext is handled internally.
  dustmail.send({
  	to: data.to,
  	from: data.from,
  	subject: data.subject,
  	template: data.template,
  	vars: data.vars
  }, function(err, data) {
  	if(err) {
  		console.log(err);
  	}else{
  		console.log(data);
  	}
  });
```
