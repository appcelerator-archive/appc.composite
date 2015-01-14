var should = require('should'),
	async = require('async'),
	url = require('url'),
	fs = require('fs'),
	APIBuilder = require('appcelerator').apibuilder,
	server = new APIBuilder(),
	log = APIBuilder.createLogger({}, { name: 'api-connector-composite TEST', useConsole: true, level: 'info' });

describe('Connector', function() {

	var Models = {};

	var firstUserID,
		firstPostID,
		firstAttachmentID;

	before(function(next) {

		server.start(function(err) {
			should(err).be.not.ok;

			// Load models from their directory.
			fs.readdirSync('./test/models/').forEach(function(file) {
				if (file.indexOf('.js') > 0) {
					var model = require('./models/' + file)(APIBuilder);
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
				firstUserID = instance.getPrimaryKey();

				Models.attachment.create({
					content: 'Test Attachment Content'
				}, function(err, instance) {
					should(err).be.not.ok;
					firstAttachmentID = instance.getPrimaryKey();

					Models.post.create({
						title: 'Test Title',
						content: 'Test Content',
						author_id: firstUserID,
						attachment_id: firstAttachmentID
					}, function(err, instance) {
						should(err).be.not.ok;
						firstPostID = instance.getPrimaryKey();

						next();
					});
				});
			});
		});
	});

	after(function(next) {
		async.parallel(
			[
				Models.user.deleteAll,
				Models.post.deleteAll,
				Models.employee.deleteAll,
				Models.habit.deleteAll
			],
			next
		);
	});

	after(function(next) {
		server.stop(next);
	});

	it('should be able to create instance', function(next) {

		var obj = {
			title: 'Test Title',
			content: 'Test Content',
			author_id: firstUserID,
			attachment_id: firstAttachmentID
		};
		Models.article.create(obj, function(err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.Object;
			should(instance.getPrimaryKey()).be.ok;
			should(instance.title).equal(obj.title);
			should(instance.content).equal(obj.content);
			should(instance.author_first_name).equal('Dawson');
			should(instance.author_last_name).equal('Toth');
			should(instance.attachment_content).equal('Test Attachment Content');
			next();
		});

	});

	it('should be able to find an instance by ID', function(next) {

		var obj = {
			title: 'Test Title',
			content: 'Test Content',
			author_id: firstUserID,
			attachment_id: firstAttachmentID
		};
		Models.article.create(obj, function(err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.Object;
			var id = instance.getPrimaryKey();
			Models.article.findOne(id, function(err, instance2) {
				should(err).be.not.ok;
				should(instance2).be.an.Object;
				should(instance2.getPrimaryKey()).equal(id);
				should(instance2.title).equal(obj.title);
				should(instance2.content).equal(obj.content);
				should(instance2.author_first_name).equal('Dawson');
				should(instance2.author_last_name).equal('Toth');
				should(instance2.attachment_content).equal('Test Attachment Content');
				next();
			});
		});

	});

	it('API-317: should be able to reference models as objects', function(next) {
		Models.contract.findAll(function(err, coll) {
			should(err).be.not.ok;
			should(coll).be.ok;
			should(coll.length).be.greaterThan(0);
			var accountWithContract = coll[0].AccountId;

			Models.account_contract.findOne(accountWithContract, function(err, instance) {
				should(err).be.not.ok;
				should(instance).be.ok;
				should(instance.contract.ContractNumber).be.ok;
				next();
			});
		});

	});

	it('should be able to query', function(callback) {

		var obj = {
			title: 'Test Title',
			content: 'Test Content',
			author_id: firstUserID,
			attachment_id: firstAttachmentID
		};
		Models.article.create(obj, function(err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.Object;
			var options = {
				where: { content: 'Test Title' },
				sel: { content: 1, author_first_name: 1 },
				order: { title: -1, content: 1 },
				limit: 3,
				skip: 0
			};
			Models.article.query(options, function(err, coll) {
				should(err).be.not.ok;

				async.eachSeries(coll, function(model, next) {
					should(model.getPrimaryKey()).be.ok;
					should(model.title).be.not.ok;
					should(model.content).be.a.String;
					should(model.author_first_name).be.a.String;
					should(model.author_last_name).be.not.ok;
					should(model.attachment_content).be.not.ok;
				}, callback);
			});
		});

	});

	it('should be able to find all instances', function(next) {

		var objs = [
			{
				title: 'Test Title 1',
				content: 'Test Content 1',
				author_id: firstUserID,
				attachment_id: firstAttachmentID
			},
			{
				title: 'Test Title 2',
				content: 'Test Content 2',
				author_id: firstUserID,
				attachment_id: firstAttachmentID
			}
		];

		Models.article.create(objs, function(err, coll) {
			should(err).be.not.ok;
			should(coll.length).equal(objs.length);

			var keys = [];
			coll.forEach(function(post) {
				keys.push(post.getPrimaryKey());
			});

			Models.article.find(function(err, coll2) {
				should(err).be.not.ok;
				should(coll2.length).be.greaterThan(coll.length - 1);

				async.eachSeries(coll2, function(post, cb) {
					should(post).be.an.Object;
					cb();
				}, function(err) {
					next(err);
				});
			});

		});

	});

	it('API-284: should handle left join when right can be null', function(next) {

		var objs = [
			{
				title: 'Test Title 1',
				content: 'Test Content 1',
				author_id: firstUserID,
				attachment_id: firstAttachmentID
			},
			{
				title: 'Test Title 2',
				content: 'Test Content 2',
				author_id: firstUserID,
				attachment_id: firstAttachmentID
			},
			{
				title: 'Test Title 3',
				content: 'Test Content 3',
				author_id: 0
			},
			{
				title: 'Test Title 4',
				content: 'Test Content 4',
				author_id: 0
			},
			{
				title: 'Test Title 5',
				content: 'Test Content 5',
				author_id: 0
			},
			{
				title: 'Test Title 6',
				content: 'Test Content 6',
				author_id: 0
			}
		];

		Models.article.create(objs, function(err, coll) {
			should(err).be.not.ok;
			should(coll.length).equal(objs.length);

			Models.article.find(function(err, coll2) {
				should(err).be.not.ok;
				should(coll2.length).be.greaterThan(coll.length - 1);

				async.eachSeries(coll2, function(post, cb) {
					should(post).be.an.Object;
					if (!post.author_id) {
						should(post.author_first_name).be.not.ok;
						should(post.author_last_name).be.not.ok;
					}
					if (!post.attachment_id) {
						should(post.attachment_content).be.not.ok;
					}
					cb();
				}, function(err) {
					next(err);
				});
			});

		});

	});

	it('API-285: should support inner join', function(next) {

		var objs = [
			{
				title: 'Test Title 1',
				content: 'Test Content 1',
				author_id: firstUserID,
				attachment_id: firstAttachmentID
			},
			{
				title: 'Test Title 2',
				content: 'Test Content 2',
				author_id: firstUserID,
				attachment_id: firstAttachmentID
			},
			{
				title: 'Test Title 3',
				content: 'Test Content 3',
				author_id: 0
			},
			{
				title: 'Test Title 4',
				content: 'Test Content 4',
				author_id: 0
			},
			{
				title: 'Test Title 5',
				content: 'Test Content 5',
				author_id: 0
			},
			{
				title: 'Test Title 6',
				content: 'Test Content 6',
				author_id: 0
			}
		];

		Models.article.create(objs, function(err, coll) {
			should(err).be.not.ok;
			should(coll.length).equal(objs.length);

			Models.authored_article.find(function(err, coll2) {
				should(err).be.not.ok;
				should(coll2.length).be.greaterThan(1);

				async.eachSeries(coll2, function(post, cb) {
					should(post).be.an.Object;
					should(post.author_id).be.ok;
					should(post.author_first_name).be.ok;
					should(post.author_last_name).be.ok;
					cb();
				}, function(err) {
					next(err);
				});
			});

		});

	});

	it('API-283: API-351: should allow 0-1-many joins', function(next) {
		Models.employee.deleteAll(function(err) {
			should(err).be.not.ok;
			Models.employee.create([
				{
					first_name: 'Employee',
					last_name: '1',
					email_address: 'e1@corp.com',
					phone_number: '1',
					home_address: '1 St'
				},
				{
					first_name: 'Employee',
					last_name: '2',
					email_address: 'e2@corp.com',
					phone_number: '2',
					home_address: '2 St'
				}
			], function(err, coll) {
				should(err).be.not.ok;
				should(coll.length).equal(2);

				Models.habit.create([
					{
						user_id: coll[0].getPrimaryKey(),
						habit: 'Programming'
					},
					{
						user_id: coll[0].getPrimaryKey(),
						habit: 'Eating'
					},
					{
						user_id: coll[0].getPrimaryKey(),
						habit: 'Sleeping'
					}
				], function(err, coll) {
					should(err).be.not.ok;
					should(coll.length).equal(3);

					Models.employee_habit.findAll(function(err, coll) {
						should(err).be.not.ok;
						should(coll.length).equal(1);
						should(coll[0].habit).be.ok;
						should(coll[0].habit.length).equal(3);
						should(coll[0].fname).be.ok;
						next();
					});
				});

			});
		});
	});

	it('should be able to update an instance', function(next) {

		var obj = {
			title: 'Test Title',
			content: 'Test Content',
			author_id: firstUserID,
			attachment_id: firstAttachmentID
		};

		Models.article.create(obj, function(err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.Object;
			var id = instance.getPrimaryKey();
			instance.set('content', 'Goodbye world');
			instance.save(function(err, result) {
				should(err).be.not.ok;
				should(result).be.an.Object;
				should(result.getPrimaryKey()).equal(id);
				should(result.title).equal(obj.title);
				should(result.content).equal('Goodbye world');
				should(result.author_first_name).equal('Dawson');
				should(result.author_last_name).equal('Toth');
				next();
			});
		});

	});

	it('should be able to batched find all', function(next) {
		var user1Data = { first_name: 'Dawson1', last_name: 'Toth1' },
			user2Data = { first_name: 'Dawson2', last_name: 'Toth2' },
			post1Data = { title: 'Title1', content: 'Content1', author_id: firstUserID },
			post2Data = { title: 'Title2', content: 'Content2', author_id: firstUserID };

		// Create test data.
		Models.user.create([user1Data, user2Data], function(err, user1) {
			should(err).be.not.ok;
			Models.post.create([post1Data, post2Data], function(err, post1) {
				should(err).be.not.ok;
				Models.user_post.findAll(function(err, result) {
					should(err).be.not.ok;
					should(result.user).be.ok;
					should(result.user.length).be.greaterThan(0);
					should(result.post).be.ok;
					should(result.post.length).be.greaterThan(0);
					next();
				});
			});
		});
	});

	it('should be able to batched query', function(next) {
		Models.user_post.query({
			user: {
				limit: 1
			},
			post: {
				where: { title: 'Title1' }
			}
		}, function(err, result) {
			should(err).be.not.ok;
			should(result.user).be.ok;
			should(result.user.length).be.greaterThan(0);
			should(result.user.length).be.lessThan(2);
			should(result.post).be.ok;
			should(result.post.length).be.greaterThan(0);
			next();
		});
	});

	it('should be able to batched findOne', function(next) {
		Models.user_post.findOne({
			user: firstUserID,
			post: firstPostID
		}, function(err, result) {
			should(err).be.not.ok;
			should(result.user).be.ok;
			should(result.user.getPrimaryKey()).be.ok;
			should(result.post).be.ok;
			should(result.post.getPrimaryKey()).be.ok;
			next();
		});
	});

	it('API-344: should be able to batch across 4 different connectors', function(next) {
		Models.uc_9a.findAll(function(err, result) {
			should(err).be.not.ok;
			should(result).be.ok;
			next();
		});
	});

	it('API-344: should be able to find contracts with salesforce id', function(next) {
		Models.sf_id.findOne('001M000000fe0V7IAI', function(err, result) {
			should(err).be.not.ok;
			should(result).be.ok;
			should(result.account).be.ok;
			should(result.contract).be.ok;
			next();
		});
	});

	it('should warn about bad joined fields', function(next) {
		var BadJoinedFieldModel = APIBuilder.Model.extend('article', {
			fields: {
				title: { type: String, model: 'post' },
				content: { type: String, model: 'post' },
				author_id: { type: Number, model: 'post' },
				author_first_name: { type: String, name: 'first_name', required: false, model: 'user' },
				author_last_name: { type: String, name: 'last_name', required: false, model: 'user' }
			},
			connector: 'appc.composite',

			metadata: {
				'appc.composite': {
					left_join: {
						model: 'user',
						join_properties: {
							'bad_id': 'author_id'
						}
					}
				}
			}
		});
		BadJoinedFieldModel.findOne(firstPostID, function(err, instance) {
			should(err).be.not.ok;
			should(instance.author_id).be.ok;
			should(instance.author_first_name).be.not.ok;
			should(instance.author_last_name).be.not.ok;
			next();
		});
	});

	it('should not allow querying on joined models (for now)', function(next) {
		var ExampleModel = APIBuilder.Model.extend('article', {
			fields: {
				title: { type: String, model: 'post' },
				author_id: { type: Number, model: 'post' },
				first_name: { type: String, model: 'user' }
			},
			connector: 'appc.composite',

			metadata: {
				'appc.composite': {
					left_join: {
						model: 'user',
						join_properties: {
							'id': 'author_id'
						}
					}
				}
			}
		});
		ExampleModel.query({ first_name: 'cant be queried on just yet' }, function(err) {
			should(err).be.ok;
			next();
		});
	});

	it('should not allow writing to joined models (for now)', function(next) {
		var ExampleModel = APIBuilder.Model.extend('article', {
			fields: {
				title: { type: String, model: 'post' },
				author_id: { type: Number, model: 'post' },
				first_name: { type: String, model: 'user' }
			},
			connector: 'appc.composite',

			metadata: {
				'appc.composite': {
					left_join: {
						model: 'user',
						join_properties: {
							'id': 'author_id'
						}
					}
				}
			}
		});
		ExampleModel.create({ first_name: 'cant be written just yet' }, function(err, instance) {
			should(err).be.ok;
			next();
		});
	});

});