var should = require('should'),
	async = require('async'),
	url = require('url'),
	fs = require('fs'),
	path = require('path'),
	Arrow = require('arrow'),
	server = new Arrow({
		ignoreDuplicateModels: true
	}),
	log = server && server.logger || Arrow.createLogger({}, {name: 'appc.composite TEST'});

var Models = {},
	IDs = {};

exports.Arrow = Arrow;
exports.server = server;
exports.log = log;
exports.Models = Models;
exports.IDs = IDs;

before(function before(next) {
	this.timeout(60 * 1000);

	server.start(function (err) {
		should(err).be.not.ok;

		// Load models from their directory.
		fs.readdirSync('./test/models/').forEach(function (file) {
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
		}, function (err, instance) {
			should(err).be.not.ok;
			IDs.user = instance.getPrimaryKey();

			Models.attachment.create({
				attachment_content: 'Test Attachment Content'
			}, function (err, instance) {
				should(err).be.not.ok;
				IDs.attachment = instance.getPrimaryKey();

				Models.post.create({
					title: 'Test Title',
					content: 'Test Content',
					author_id: IDs.user,
					attachment_id: IDs.attachment
				}, function (err, instance) {
					should(err).be.not.ok;
					IDs.post = instance.getPrimaryKey();

					var mysql = server.getConnector('appc.mysql');
					mysql.getConnection(function (err, connection) {
						if (err) { return next(err); }
						var scripts = fs.readFileSync(path.join(__dirname, '/scripts/employees.sql'), 'UTF-8').split(';');
						async.eachSeries(scripts, function (script, cb) {
							if (!script.trim()) { return cb(); }
							connection.query(script, [mysql.config.database], function (err) {
								if (err) { return cb(err); }
								else { cb(); }
							});
						}, function (err) {
							if (mysql.pool) { connection.release(); }
							if (err) { next(err); }
							else { next(); }
						});
					});
				});
			});
		});
	});
});

after(function (next) {
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

it('should require a minimum version of Arrow', function () {
	var mockConnector = {
		Capabilities: {},
		extend: function () {}
	};

	should(function () {
		require('../lib/index').create({
			Connector: mockConnector
		});
	}).throw();
	should(function () {
		require('../lib/index').create({
			Version: '1.2.0',
			Connector: mockConnector
		});
	}).throw();
	should(function () {
		require('../lib/index').create({
			Version: '1.5.0',
			Connector: mockConnector
		});
	}).not.throw();
});


after(function (next) {
	server.stop(next);
});