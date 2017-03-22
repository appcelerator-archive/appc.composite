var should = require('should'),
	async = require('async'),
	common = require('./common'),
	Arrow = common.Arrow;

describe.only('Inner Join', function () {

	var Models = common.Models,
		IDs = common.IDs,
		MasterModel,
		ChildModel,
		ChildModel2,
		JoinedModel;
	
	before(function (done) {
		MasterModel = Arrow.Model.extend('masterModel', {
			fields: {rid: {type: Number}, name: {type: Object}},
			connector: 'memory'
		});
		ChildModel = Arrow.Model.extend('childModel', {
			fields: {rid: {type: Number}, languages: {type: Object}},
			connector: 'memory'
		});
		ChildModel2 = Arrow.Model.extend('childModel2', {
			fields: {rid: {type: Number}, nationalities: {type: Array}},
			connector: 'memory'
		});

		common.server.addModel(MasterModel);
		common.server.addModel(ChildModel);
		common.server.addModel(ChildModel2);

		async.series([
			function(next) {
				MasterModel.create([{rid: 0, name: {fname: 'Zero'}}, {rid: 1, name: {fname: 'One'}}], next);
			},
			function(next) {
				ChildModel.create([{rid: 0, languages: {native: 'FR'}}, {rid: 1, languages: {native: 'EN'}}], next);
			},
			function(next) {
				ChildModel2.create([{rid: 0, nationalities: ['CA']}, {rid: 1, nationalities: ['US']}], next);
			}
		], done);
	});

	beforeEach(function () {
		JoinedModel = Arrow.Model.extend('joinedMasterChildModel', {
			fields: {
				rid: {type: Number, name: 'rid', model: 'masterModel'},
				name: {type: Object, name: 'name', model: 'masterModel'},
				languages: {type: Object, name: 'languages', model: 'childModel'},
				nationalities: {type: Array, name: 'nationalities', model: 'childModel2'}
			},
			connector: 'appc.composite',

			metadata: {
				inner_join: [{
					model: 'childModel',
					join_properties: {
						rid: 'rid'
					}
				},
				{
					model: 'childModel2',
					join_properties: {
						rid: 'rid'
					}
				}]
			}
		});
	});

	it('API-285: should support inner join', function (next) {
		var objs = [
			{
				title: 'Test Title 1',
				content: 'Test Content 1',
				author_id: IDs.user,
				attachment_id: IDs.attachment
			},
			{
				title: 'Test Title 2',
				content: 'Test Content 2',
				author_id: IDs.user,
				attachment_id: IDs.attachment
			},
			{
				title: 'Test Title 3',
				content: 'Test Content 3',
				author_id: 0
			},
			{
				title: 'Test Title 4',
				content: 'Test Content 4',
				author_id: -50
			},
			{
				title: 'Test Title 5',
				content: 'Test Content 5',
				author_id: -20
			},
			{
				title: 'Test Title 6',
				content: 'Test Content 6',
				author_id: -30
			}
		];

		Models.article.create(objs, function (err, coll) {
			should(err).be.not.ok();
			should(coll.length).equal(objs.length);

			Models.authored_article.find(function (err, coll2) {
				should(err).be.not.ok();
				should(coll2.length).be.greaterThan(1);

				async.eachSeries(coll2, function (post, cb) {
					should(post).be.an.Object();
					should(post.author_id).be.ok();
					should(post.author_first_name).be.ok();
					should(post.author_last_name).be.ok();
					cb();
				}, function (err) {
					next(err);
				});
			});
		});
	});

	it('should return no results on failed inner join', function (next) {
		var objs = [
			{
				title: 'Test Title 4',
				content: 'Test Content 4',
				author_id: -50
			},
			{
				title: 'Test Title 5',
				content: 'Test Content 5',
				author_id: -20
			},
			{
				title: 'Test Title 6',
				content: 'Test Content 6',
				author_id: -30
			}
		];

		Models.article.create(objs, function (err, coll) {
			should(err).be.not.ok();
			should(coll.length).equal(objs.length);

			Models.bad_inner_join.find(function (err) {
				should(err).be.not.ok();
				next();
			});
		});
	});

	// should support join as 'fields'
	it('RDPP-888: should handle join as "field" correctly', function (next) {
		common.server.addModel(JoinedModel);
		JoinedModel.findAll(verifyJoin);
		function verifyJoin(err, results) {
			should(err).be.not.ok();
			should(results.length).be.ok();
			for (var i = 0; i < results.length; i++) {
				var result = results[i];
				should(result.name).be.ok();
				should(result.languages).be.instanceof(Object);
				should(result.languages.native).be.ok();
				should(result.nationalities).be.instanceof(Array);
				should(result.nationalities[0]).be.instanceof(String);
			}
			next();
		}
	});

	// should support join as 'object'
	it('RDPP-915: should handle join as "object" correctly', function (next) {
		delete JoinedModel.fields.languages.name;
		common.server.addModel(JoinedModel);
		JoinedModel.findAll(verifyJoin);
		function verifyJoin(err, results) {
			should(err).be.not.ok();
			should(results.length).be.ok();
			for (var i = 0; i < results.length; i++) {
				var result = results[i];
				should(result.name).be.ok();
				should(result.languages).be.instanceof(Object);
				should(result.languages).have.keys('rid', 'languages');
			}
			next();
		}
	});

	// should support join as 'array'
	it('RDPP-994: should handle join as "array" correctly', function (next) {
		delete JoinedModel.fields.nationalities.name;
		common.server.addModel(JoinedModel);
		JoinedModel.findAll(verifyJoin);
		function verifyJoin(err, results) {
			should(err).be.not.ok();
			should(results.length).be.ok();
			for (var i = 0; i < results.length; i++) {
				var result = results[i];
				should(result.name).be.ok();
				should(result.nationalities).be.instanceof(Array);
				should(result.nationalities[0]).have.keys('rid', 'nationalities');
			}
			next();
		}
	});
});
