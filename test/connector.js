var should = require('should'),
	async = require('async'),
	url = require('url'),
	APIBuilder = require('appcelerator').apibuilder,
	server = new APIBuilder(),
	log = APIBuilder.createLogger({}, { name: 'api-connector-composite TEST', useConsole: true, level: 'info' });

describe('Connector', function() {

	/*
	 Done: c1. Use models for a left join.
	 Done: c2. Also do model without any join.
	 Done: c3. No join, but common input param to query multiple.
	 TODO: c4. Do a left join with multiple results (one left, zero-to-many right).
	 */
	var UserModel = require('./models/user')(APIBuilder),
		PostModel = require('./models/post')(APIBuilder),
		ArticleModel = require('./models/article')(APIBuilder),
		UserPostModel = require('./models/user_post')(APIBuilder),
		EmployeeModel = require('./models/employee')(APIBuilder),
		HabitModel = require('./models/habit')(APIBuilder),
		EmployeeHabitModel = require('./models/employeeHabit')(APIBuilder);

	var firstUserID,
		firstPostID;

	before(function(next) {
		server.addModel(UserModel);
		server.addModel(PostModel);
		server.addModel(ArticleModel);
		server.addModel(UserPostModel);
		server.addModel(EmployeeModel);
		server.addModel(HabitModel);
		server.addModel(EmployeeHabitModel);

		server.start(function(err) {
			should(err).be.not.ok;

			UserModel.create({
				first_name: 'Dawson',
				last_name: 'Toth'
			}, function(err, instance) {
				firstUserID = instance.getPrimaryKey();

				PostModel.create({
					title: 'Test Title',
					content: 'Test Content',
					author_id: firstUserID
				}, function(err, instance) {
					firstPostID = instance.getPrimaryKey();
					next();
				});
			});
		});
	});

	after(function(next) {
		async.parallel(
			[
				UserModel.deleteAll,
				PostModel.deleteAll,
				EmployeeModel.deleteAll,
				HabitModel.deleteAll
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
			author_id: firstUserID
		};
		ArticleModel.create(obj, function(err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.Object;
			should(instance.getPrimaryKey()).be.ok;
			should(instance.title).equal(obj.title);
			should(instance.content).equal(obj.content);
			should(instance.author_first_name).equal('Dawson');
			should(instance.author_last_name).equal('Toth');
			next();
		});

	});

	it('should be able to find an instance by ID', function(next) {

		var obj = {
			title: 'Test Title',
			content: 'Test Content',
			author_id: firstUserID
		};
		ArticleModel.create(obj, function(err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.Object;
			var id = instance.getPrimaryKey();
			ArticleModel.findOne(id, function(err, instance2) {
				should(err).be.not.ok;
				should(instance2).be.an.Object;
				should(instance2.getPrimaryKey()).equal(id);
				should(instance2.title).equal(obj.title);
				should(instance2.content).equal(obj.content);
				should(instance2.author_first_name).equal('Dawson');
				should(instance2.author_last_name).equal('Toth');
				next();
			});
		});

	});

	it('should be able to query', function(callback) {

		var obj = {
			title: 'Test Title',
			content: 'Test Content',
			author_id: firstUserID
		};
		ArticleModel.create(obj, function(err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.Object;
			var options = {
				where: { content: 'Test Title' },
				sel: { content: 1, author_first_name: 1 },
				order: { title: -1, content: 1 },
				limit: 3,
				skip: 0
			};
			ArticleModel.query(options, function(err, coll) {
				should(err).be.not.ok;

				async.eachSeries(coll, function(model, next) {
					should(model.getPrimaryKey()).be.ok;
					should(model.title).be.not.ok;
					should(model.content).be.a.String;
					should(model.author_first_name).be.a.String;
					should(model.author_last_name).be.not.ok;
				}, callback);
			});
		});

	});

	it('should be able to find all instances', function(next) {

		var objs = [
			{
				title: 'Test Title 1',
				content: 'Test Content 1',
				author_id: firstUserID
			},
			{
				title: 'Test Title 2',
				content: 'Test Content 2',
				author_id: firstUserID
			}
		];

		ArticleModel.create(objs, function(err, coll) {
			should(err).be.not.ok;
			should(coll.length).equal(objs.length);

			var keys = [];
			coll.forEach(function(post) {
				keys.push(post.getPrimaryKey());
			});

			ArticleModel.find(function(err, coll2) {
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
				author_id: firstUserID
			},
			{
				title: 'Test Title 2',
				content: 'Test Content 2',
				author_id: firstUserID
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

		ArticleModel.create(objs, function(err, coll) {
			should(err).be.not.ok;
			should(coll.length).equal(objs.length);

			ArticleModel.find(function(err, coll2) {
				should(err).be.not.ok;
				should(coll2.length).be.greaterThan(coll.length - 1);

				async.eachSeries(coll2, function(post, cb) {
					should(post).be.an.Object;
					if (!post.author_id) {
						should(post.author_first_name).be.not.ok;
						should(post.author_last_name).be.not.ok;
					}
					cb();
				}, function(err) {
					next(err);
				});
			});

		});

	});

	it('API-283: should allow 0-1-many joins', function(next) {
		EmployeeModel.create([
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

			HabitModel.create([
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

				EmployeeHabitModel.findAll(function(err, coll) {
					should(err).be.not.ok;
					should(coll.length).equal(2);
					console.log(coll);
					should(coll[0].habit).be.ok;
					should(coll[0].habit.length).equal(3);
					should(coll[1].habit).be.not.ok;
					next();
				});
			});

		});
	});

	it('should be able to update an instance', function(next) {

		var obj = {
			title: 'Test Title',
			content: 'Test Content',
			author_id: firstUserID
		};

		ArticleModel.create(obj, function(err, instance) {
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
		UserModel.create(user1Data, function(err, user1) {
			should(err).be.not.ok;
			UserModel.create(user2Data, function(err, user2) {
				should(err).be.not.ok;
				PostModel.create(post1Data, function(err, post1) {
					should(err).be.not.ok;
					PostModel.create(post2Data, function(err, post2) {
						should(err).be.not.ok;
						UserPostModel.findAll(function(err, result) {
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
		});
	});

	it('should be able to batched query', function(next) {
		UserPostModel.query({
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
		UserPostModel.findOne({
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

});