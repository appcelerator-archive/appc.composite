var should = require('should');
var async = require('async');
var utils = require('../utils')();

describe('Composite - Unrelated Models Batching', function () {

	beforeEach(function (next) {
		utils.loadModelsToServer('unit', 'db-batching');
		async.series([
			function (done) {
				utils.createModelInstance('Superuser', {
					first_name: 'Michael',
					last_name: 'Jordan',
					nickname: 'MJ',
					mobile: '23',
					email: 'mj@chicago.com'
				}, done);
			},
			function (done) {
				utils.createModelInstance('Superuser', {
					first_name: 'Lebron',
					last_name: 'James',
					nickname: 'LJ',
					mobile: '32',
					email: 'lj@miami.com'
				}, done);
			},
			function (done) {
				utils.createModelInstance('Post', {
					title: 'Post 1',
					content: 'TLDR'
				}, done);
			},
			function (done) {
				utils.createModelInstance('Post', {
					title: 'Post 2',
					content: 'Nice one'
				}, done);
			}									
		], next);
	});

	it('[RDPP-4451-32] Should be able to find all', function (next) {
		utils.server().models.SuperusersPosts.find(validate);
		function validate(err, result) {
			should(result).is.Object();
			should(result.posts.length).equal(2);
			should(result.users.length).equal(2);
			next();
		}
	});

	it('[RDPP-4451-33] Should be able to findByID', function (next) {
		var userId = utils.server().instances.Superuser[0].getPrimaryKey();
		var postId = utils.server().instances.Post[0].getPrimaryKey();
		utils.server().models.SuperusersPosts.findByID({
			users: userId,
			posts: postId
		}, validate);
		function validate(err, result) {
			should(result).is.Object();
			should(result.posts).is.Object();
			should(result.posts.id).equal(postId);
			should(result.users).is.Object();
			should(result.users.id).equal(userId);
			next();
		}
	});

	it('[RDPP-4451-31] Should be able to findByID with JSON.stringify', function (next) {
		var userId = utils.server().instances.Superuser[0].getPrimaryKey();
		var postId = utils.server().instances.Post[0].getPrimaryKey();
		utils.server().models.SuperusersPosts.findByID(JSON.stringify({
			users: userId,
			posts: postId
		}), validate);
		function validate(err, result) {
			should(result).is.Object();
			next();
		}
	});

	it('[RDPP-4451-34] Should be able to query', function (next) {
		utils.server().models.SuperusersPosts.query({
			users: { limit: 1 },
			posts: { where: { title: 'Post 1' } }
		}, validate);
		function validate(err, result) {
			should(result).is.Object();
			should(result.posts.length).equal(1);
			should(result.users.length).equal(1);
			next();
		}
	});

});
