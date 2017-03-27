var should = require('should'),
	async = require('async'),
	common = require('./common'),
	Arrow = common.Arrow;

describe('Connector', function () {

	var Models = common.Models,
		IDs = common.IDs;

	it('should be able to batched find all', function (next) {
		var user1Data = { first_name: 'Dawson1', last_name: 'Toth1' },
			user2Data = { first_name: 'Dawson2', last_name: 'Toth2' },
			post1Data = { title: 'Title1', content: 'Content1', author_id: IDs.user },
			post2Data = { title: 'Title2', content: 'Content2', author_id: IDs.user };

		// Create test data.
		Models.user.create([user1Data, user2Data], function (err, user1) {
			should(err).be.not.ok();
			Models.post.create([post1Data, post2Data], function (err, post1) {
				should(err).be.not.ok();
				Models.user_post.findAll(function (err, result) {
					should(err).be.not.ok();
					should(result.users).be.ok();
					should(result.users.length).be.greaterThan(0);
					should(result.posts).be.ok();
					should(result.posts.length).be.greaterThan(0);
					next();
				});
			});
		});
	});

	it('should be able to batched query', function (next) {
		Models.user_post.query({
			users: { limit: 2 },
			posts: { where: { title: 'Title1' } }
		}, function (err, result) {
			should(err).be.not.ok();
			should(result.users).be.ok();
			should(result.users.length).be.greaterThan(0);
			should(result.users.length).be.lessThan(3);
			should(result.posts).be.ok();
			should(result.posts.length).be.greaterThan(0);
			next();
		});
	});

	it('should be able to batched findByID', function (next) {
		Models.user_post.findByID({
			users: IDs.user,
			posts: IDs.post
		}, function (err, result) {
			should(err).be.not.ok();
			should(result.users).be.ok();
			should(result.users.getPrimaryKey()).be.ok();
			should(result.posts).be.ok();
			should(result.posts.getPrimaryKey()).be.ok();
			next();
		});
	});

	it('should be able to batched findByID with stringified params', function (next) {
		Models.user_post.findByID(JSON.stringify({
			users: IDs.user,
			posts: IDs.post
		}), function (err, result) {
			should(err).be.not.ok();
			should(result.users).be.ok();
			should(result.users.getPrimaryKey()).be.ok();
			should(result.posts).be.ok();
			should(result.posts.getPrimaryKey()).be.ok();
			next();
		});
	});

	it('should be able to handle bad stringified params', function (next) {
		Models.user_post.findByID("{ some: bad json }", function (err, result) {
			should(err).be.ok();
			next();
		});
	});

	it.skip('API-344: should be able to batch across 4 different connectors', function (next) {
		Models.uc_9a.findAll(function (err, result) {
			should(err).be.not.ok();
			should(result).be.ok();

			Models.uc_9a.query({
				users: { where: { last_name: 'Toth' } },
				mssql_posts: { where: { title: { $like: '%foo%' } } },
				mongo_posts: { where: { title: { $like: '%o%' } } },
				accounts: { where: { Name: { $like: '%ee%' } } }
			}, function (err, results) {
				should(err).be.not.ok();
				should(results).be.ok();
				for (var i = 0; i < results.users.length; i++) {
					should(results.users[i].last_name).equal('Toth');
				}
				next();
			});
		});
	});

	it.skip('API-567: should not mysql error on bad regex field', function (next) {
		Models.multijoin.query({
			where: {
				employees: { where: { email_address: { $like: 'smith.com' } } },
				teams: { where: { division: 'AFC' } },
				cities: { where: { name: { $like: '%esno' } } },
				accounts: { where: { Name: 'Foo' } },
				cars: { where: { model: { $like: 'anza%' } } }
			}
		}, function (err, results) {
			should(err).be.not.ok();
			should(results).be.ok();
			should(results.employees).be.ok();
			should(results.teams).be.ok();
			should(results.accounts).be.ok();
			next();
		});
	});

});
