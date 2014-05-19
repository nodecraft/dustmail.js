var fs = require('fs'),
	_ = require('underscore'),
	dust = require('dustjs-linkedin'),
	html_strip = require('htmlstrip-native'),
	async = require('async');

module.exports = function(options){
	var defaults = {
		layouts_dir: './emails/layouts/',
		partials_dir: './emails/partials/',
		templates_dir: './emails/',
		driver: false
	};
	options = options || {};
	_.defaults(options, defaults);
	var helpers =  {
		compileTemplates: function() {
			// compile and prepare layouts
			var layouts = fs.readdirSync(options.layouts_dir);
			_.each(layouts, function(layout) {
				dust.loadSource(dust.compile(fs.readFileSync(options.layouts_dir+layout, 'utf8'), 'layouts/'+layout.replace('.dust', '')));
			});

			// complile and prepare partials
			var partials = fs.readdirSync(options.partials_dir);
			_.each(partials, function(partial) {
				dust.loadSource(dust.compile(fs.readFileSync(options.partials_dir+partial, 'utf8'), 'partials/'+partial.replace('.dust', '')));
			});
		},
		clone: function(data){
			data = JSON.parse(JSON.stringify(data));
			return data
		},
		santizeSendingType: function(data) {
			switch(data.sendType) {
				case 'html':
					if(data.render) {
						delete data.render.TextBody
					};
				break;
				case 'text':
					if(data.render) {
						delete data.render.HtmlBody
					};
				break;
			}
		}
	};
	helpers.compileTemplates();
	return {
		driver: function(driverName) {
			if(typeof(driverName) == 'function') {
				options.driver = driverName;
			}
		},
		recompile: function() {
			helpers.compileTemplates();
		},
		render: function(template, vars, callback) {
			var emailData = {},
				templateFile = options.templates_dir+template+'.dust',
				loadedTemplates = [];
			// check if template actually exists
			if(loadedTemplates.indexOf(template) === -1) {
				if(fs.existsSync(templateFile)) {
					dust.loadSource(dust.compile(fs.readFileSync(templateFile, 'utf8'), 'template_'+template));
					loadedTemplates.push(template);
				}else if(typeof(template == 'string')) { // if it doesn't exist, assume the template is a long, to be compiled string
					try {
						dust.loadSource(dust.compile(template, 'template_temp'));
						template = 'temp'; // easy reference later
					}catch(e) {
						return callback({message:'Invalid template specified', raw: e});
					}
				} else{
					return callback({message:'Invalid template specified'});
				}
			}
			async.series([
				function(acallback) {
					dust.render('template_'+template, vars, function(err, out) {
						if(err) {
							acallback(err);
						}else{
							emailData['HtmlBody'] = out;
							acallback(null);
						}
					})
				},
				// render again, this time with plaintext
				function(acallback) {
					var plaintextVars = helpers.clone(vars);
					plaintextVars._plaintext = true; // we can use this var in templates to specifically target plaintext bodys
					dust.render('template_'+template, plaintextVars, function(err, out) {
						if(err) {
							acallback(err);
						}else{
							emailData['TextBody'] = html_strip.html_strip(out, {
								include_script: false,
						        include_style: false,
						        compact_whitespace: false
						    });
						    acallback(null);
						}
					})
				}
			], function(err) {
				if(err){
					callback({message: 'Email generation failed', raw: err});
				}else{
					callback(null, emailData);
				}
			});
		},
		send: function(emailData, callback) {
			if(options.driver == false) {
				return callback({message: 'Invalid dustmail driver'});
			}
			if(emailData.render) {
				helpers.santizeSendingType(emailData);
				options.driver(emailData, function(err, result) {
					if(err) {
						callback({message: 'Sending emailed failed', raw: err});
					}else{
						callback(null,result);
					}
				});
			}else{
				this.render(emailData.template, emailData.vars, function(err, data) {
					emailData.render = data;
					helpers.santizeSendingType(emailData);
					console.log(emailData);
					options.driver(emailData, function(err, result) {
						if(err) {
							callback({message: 'Sending emailed failed', raw: err});
						}else{
							callback(null,result);
						}
					});
				});
			}
		}
	}
}