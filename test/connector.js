var should = require('should'),
	async = require('async'),
	url = require('url'),
	APIBuilder = require('appcelerator').apibuilder,
	server = new APIBuilder(),
	Connector = require('../lib').create(APIBuilder, server),
	log = APIBuilder.createLogger({}, { name: 'api-connector-composite TEST', useConsole: true, level: 'info' });

describe('Connector', function() {

	var connector = new Connector(),
	/*
	 Done: c1. Use models.
	 TODO: c2. Also do model without any join.
	 TODO: c3. No join, but common input param to query multiple.
	 */
		UserModel = APIBuilder.Model.extend('user', {
			fields: {
				first_name: { type: String },
				last_name: { type: String }
			},
			connector: 'appc.mysql'
		}),
		PostModel = APIBuilder.Model.extend('post', {
			fields: {
				title: { type: String },
				content: { type: String },
				author_id: { type: Number }
			},
			connector: 'appc.mongo'
		}),
		JoinedModel = APIBuilder.Model.extend('article', {
			fields: {
				title: { type: String },
				content: { type: String },
				author_id: { type: Number },
				author_first_name: { type: String, name: 'first_name', required: false },
				author_last_name: { type: String, name: 'last_name', required: false }
			},
			connector: connector,

			metadata: {
				composite: {
					models: [
						{
							name: 'post'
						},
						{
							name: 'user',
							left_join: {
								'id': 'author_id'
							}
						}
					]
				}
			}
		}),
		BatchedModel = APIBuilder.Model.extend('users_posts', {
			fields: {
				users: { collection: 'user' },
				posts: { collection: 'post' }
			},
			connector: connector,

			metadata: {
				composite: {
					models: [
						{
							model: 'post'
						},
						{
							model: 'user'
						}
					]
				}
			}
		});

	before(function(next) {
		server.addModel(UserModel);
		server.addModel(PostModel);
		server.addModel(JoinedModel);
		server.addModel(BatchedModel);

		server.start(function() {
			next();
		});
	});

	after(function(next) {
		server.stop(next);
	});

	it('should be able to create instance', function(next) {

		var obj = {
			title: 'Test Title',
			content: 'Test Content',
			author_id: 1
		};
		JoinedModel.create(obj, function(err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.Object;
			should(instance.getPrimaryKey()).be.ok;
			should(instance.title).equal(obj.title);
			should(instance.content).equal(obj.content);
			should(instance.author_first_name).equal('Dawson');
			should(instance.author_last_name).equal('Toth');
			instance.delete(next);
		});

	});

	it('should be able to find an instance by ID', function(next) {

		var obj = {
			title: 'Test Title',
			content: 'Test Content',
			author_id: 1
		};
		JoinedModel.create(obj, function(err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.Object;
			var id = instance.getPrimaryKey();
			JoinedModel.find(id, function(err, instance2) {
				should(err).be.not.ok;
				should(instance2).be.an.Object;
				should(instance2.getPrimaryKey()).equal(id);
				should(instance2.title).equal(obj.title);
				should(instance2.content).equal(obj.content);
				should(instance2.author_first_name).equal('Dawson');
				should(instance2.author_last_name).equal('Toth');
				instance.delete(next);
			});
		});

	});

	it('should be able to query', function(callback) {

		var obj = {
			title: 'Test Title',
			content: 'Test Content',
			author_id: 1
		};
		JoinedModel.create(obj, function(err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.Object;
			var options = {
				where: { content: 'Test Title' },
				sel: { content: 1, author_first_name: 1 },
				order: { title: -1, content: 1 },
				limit: 3,
				skip: 0
			};
			JoinedModel.query(options, function(err, coll) {
				should(err).be.not.ok;

				async.eachSeries(coll, function(model, next) {
					should(model.getPrimaryKey()).be.ok;
					should(model.title).be.not.ok;
					should(model.content).be.a.String;
					should(model.author_first_name).be.a.String;
					should(model.author_last_name).be.not.ok;
					model.remove(next);
				}, callback);
			});
		});

	});

	it('should be able to find all instances', function(next) {

		var objs = [
			{
				title: 'Test Title 1',
				content: 'Test Content 1',
				author_id: 1
			},
			{
				title: 'Test Title 2',
				content: 'Test Content 2',
				author_id: 1
			}
		];

		JoinedModel.create(objs, function(err, coll) {
			should(err).be.not.ok;
			should(coll.length).equal(objs.length);

			var keys = [];
			coll.forEach(function(post) {
				keys.push(post.getPrimaryKey());
			});

			JoinedModel.find(function(err, coll2) {
				should(err).be.not.ok;
				should(coll2.length).be.greaterThan(coll.length - 1);

				async.eachSeries(coll2, function(post, next_) {
					should(post).be.an.Object;
					post.delete(next_);
				}, function(err) {
					next(err);
				});
			});

		});

	});

	it('should be able to update an instance', function(next) {

		var obj = {
			title: 'Test Title',
			content: 'Test Content',
			author_id: 1
		};

		JoinedModel.create(obj, function(err, instance) {
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
				instance.delete(next);
			});
		});

	});

});