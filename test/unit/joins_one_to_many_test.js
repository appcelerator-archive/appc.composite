var should = require('should');
var async = require('async');
var utils = require('../utils')();

describe('Composite - One to Many', function () {
	beforeEach(function (next) {
		utils.loadModelsToServer('unit', 'db-one-to-many');
		async.series([
			function (done) {
				utils.createModelInstance('Author', {
					first_name: 'Michael',
					last_name: 'Jordan',
					nickname: 'MJ',
					mobile: '23',
					email: 'mj@chicago.com'
				}, done);
			},
			function (done) {
				utils.createModelInstance('Author', {
					first_name: 'Lebron',
					last_name: 'James',
					nickname: 'LJ',
					mobile: '32',
					email: 'lj@miami.com'
				}, done);
			},
			function (done) {
				utils.createModelInstance('Author', {
					first_name: 'Kobe',
					last_name: 'Bryant',
					nickname: 'KB',
					mobile: '24',
					email: 'kb@la.com'
				}, done);
			},
			function (done) {
				utils.createModelInstance('Post', {
					title: 'Post 2',
					content: 'Nice one',
					author_id: utils.server().instances.Author[0].getPrimaryKey()
				}, done);
			},
			function (done) {
				utils.createModelInstance('Post', {
					title: 'Post 3',
					content: 'My Post 3 Content',
					author_id: utils.server().instances.Author[0].getPrimaryKey()
				}, done);
			},
			function (done) {
				utils.createModelInstance('Post', {
					title: 'Post 1',
					content: 'TLDR',
					author_id: utils.server().instances.Author[1].getPrimaryKey()
				}, done);
			}
		], next);
	});

	/**
	 * We get Array with the whole joined object data when no field is specified
	 */
	it('[RDPP-4451] Left Join Array - No Alias - No Mupltiple', function (next) {
		utils.server().models.Blog1.find(function (err, result) {
			should(result.length).equal(3);
			should(result[0].posts.length).equal(2);
			should(result[0].posts[0]).is.Object();
			should(result[0].posts[0].title).equal(utils.server().instances.Post[0].title);
			should(result[1].posts.length).equal(1);
			should(result[2].posts).be.not.ok();
			return next();
		});
	});

	/**
	 * Multiple has no effect here and we get the same as previous
	 */
	it('[RDPP-4451] Left Join Array - No Alias - With Multiple', function (next) {
		utils.server().models.Blog2.find(function (err, result) {
			should(result.length).equal(3);
			should(result[0].posts.length).equal(2);
			should(result[0].posts[0]).is.Object();
			should(result[0].posts[0].title).equal(utils.server().instances.Post[0].title);
			should(result[1].posts.length).equal(1);
			should(result[2].posts).be.not.ok();
			return next();
		});
	});

	/**
	 * We defined an Alias which denotes which data from the references Model we need.
	 * So we endup getting String instead of Array for the joined models.
	 */
	it('[RDPP-4451] Left Join Array - With Alias - No Multiple', function (next) {
		utils.server().models.Blog3.find(function (err, result) {
			should(result.length).equal(3);
			should(result[0].posts).is.String();
			should(result[0].posts).equal(utils.server().instances.Post[0].title);
			should(result[1].posts).is.String();
			should(result[2].posts).be.not.ok();
			return next();
		});
	});

	/**
	 * Real one to many relationship.
	 *
	 * We defined an Alias which denotes which data from the references Model we need.
	 * So we endup getting Array with strings. Multiple property has no real effect.
	 */
	it('[RDPP-4451] Left Join - With Alias - With Multiple', function (next) {
		utils.server().models.Blog4.find(function (err, result) {
			should(result.length).equal(3);
			should(result[0].posts.length).equal(2);
			should(result[0].posts[0]).is.String();
			should(result[0].posts[0]).equal(utils.server().instances.Post[0].title);
			should(result[1].posts.length).equal(1);
			should(result[2].posts).be.not.ok();
			return next();
		});
	});

	/**
	 * We get Array with the whole joined object data when no field is specified
	 */
	it('[RDPP-4451] Inner Join Array - No Alias - No Mupltiple', function (next) {
		utils.server().models.Blog5.find(function (err, result) {
			should(result.length).equal(2);
			should(result[0].posts.length).equal(2);
			should(result[0].posts[0]).is.Object();
			should(result[0].posts[0].title).equal(utils.server().instances.Post[0].title);
			should(result[1].posts.length).equal(1);
			return next();
		});
	});

	/**
	 * Multiple has no effect here and we get the same as previous
	 */
	it('[RDPP-4451] Inner Join Array - No Alias - With Multiple', function (next) {
		utils.server().models.Blog6.find(function (err, result) {
			should(result.length).equal(2);
			should(result[0].posts.length).equal(2);
			should(result[0].posts[0]).is.Object();
			should(result[0].posts[0].title).equal(utils.server().instances.Post[0].title);
			should(result[1].posts.length).equal(1);
			return next();
		});
	});

	/**
	 * We defined an Alias which denotes which data from the references Model we need.
	 * So we endup getting String instead of Array for the joined models.
	 * Ticket: https://techweb.axway.com/jira/browse/RDPP-4461
	 */
	it('[RDPP-4451] Inner Join Array - With Alias - No Multiple', function (next) {
		utils.server().models.Blog7.find(function (err, result) {
			should(result.length).equal(2);
			should(result[0].posts).is.String();
			should(result[0].posts).equal(utils.server().instances.Post[0].title);
			should(result[1].posts).is.String();
			should(result[1].posts).equal(utils.server().instances.Post[2].title);
			return next();
		});
	});

	/**
	 * Real one to many relationship.
	 *
	 * We defined an Alias which denotes which data from the references Model we need.
	 * So we endup getting Array with strings. Multiple property has no real effect.
	 */
	it('[RDPP-4451] Inner Join Array - With Alias - With Multiple', function (next) {
		utils.server().models.Blog8.find(function (err, result) {
			should(result.length).equal(2);
			should(result[0].posts).is.Array();
			should(result[0].posts.length).equal(2);
			should(result[0].posts[0]).is.String();
			should(result[0].posts[0]).equal(utils.server().instances.Post[0].title);
			should(result[1].posts.length).equal(1);
			return next();
		});
	});

});

