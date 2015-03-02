var should = require('should'),
	async = require('async'),
	url = require('url'),
	fs = require('fs'),
	Arrow = require('arrow'),
	server = new Arrow({
		ignoreDuplicateModels: true
	}),
	log = server && server.logger || Arrow.createLogger({}, { name: 'appc.composite TEST' });

var Models = {},
	IDs = {};

exports.Arrow = Arrow;
exports.server = server;
exports.log = log;
exports.Models = Models;
exports.IDs = IDs;

before(function before(next) {
	this.timeout(60 * 1000);

	server.start(function(err) {
		should(err).be.not.ok;

		// Load models from their directory.
		fs.readdirSync('./test/models/').forEach(function(file) {
			if (file.indexOf('.js') > 0) {
				var model = require('./models/' + file)(Arrow);
				Models[model.name] = model;
				log.info('loaded model ' + model.name);
				server.addModel(model);
			}
		});
		Models.employee = server.getModel('appc.mysql/nolan_user');
		Models.habit = server.getModel('appc.mysql/nolan_user_bad_habits');

		Models.user.create({
			first_name: 'Dawson',
			last_name: 'Toth'
		}, function(err, instance) {
			should(err).be.not.ok;
			IDs.user = instance.getPrimaryKey();

			Models.attachment.create({
				attachment_content: 'Test Attachment Content'
			}, function(err, instance) {
				should(err).be.not.ok;
				IDs.attachment = instance.getPrimaryKey();

				Models.post.create({
					title: 'Test Title',
					content: 'Test Content',
					author_id: IDs.user,
					attachment_id: IDs.attachment
				}, function(err, instance) {
					should(err).be.not.ok;
					IDs.post = instance.getPrimaryKey();

					next();
				});
			});
		});
	});
});

after(function(next) {
	async.parallel(
		[
			Models.user.deleteAll.bind(Models.user),
			Models.post.deleteAll.bind(Models.post),
			Models.employee.deleteAll.bind(Models.employee),
			Models.habit.deleteAll.bind(Models.habit)
		],
		next
	);
});

after(function(next) {
	server.stop(next);
});