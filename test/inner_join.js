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
			fields: {rid: {type: Number}, nationality: {type: String}},
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
				ChildModel.create([{rid: 0, languages: {native: 'FR'}}, {rid: 1, languages: {native: 'EN'}}, {rid: 1, languages: {native: 'DE'}}], next);
			},
			function(next) {
				ChildModel2.create([{rid: 0, nationality: 'CA'}, {rid: 0, nationality: 'JP'}, {rid: 1, nationality: 'US'}], next);
			}
		], done);
	});

	beforeEach(function () {
		JoinedModel = Arrow.Model.extend('joinedMasterChildModel', {
			fields: {
				rid: {type: Number, name: 'rid', model: 'masterModel'},
				name: {type: Object, name: 'name', model: 'masterModel'},
				languages: {type: Object, name: 'languages', model: 'childModel'},
				nationality: {type: String, name: 'nationality', model: 'childModel2'}
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
			should(results.length).equal(2);
			
			var result = results[0];
			should(result).have.property('name', { fname: 'Zero' });
			should(result).have.property('languages', { native: 'FR' });
			should(result).have.property('nationality', 'CA');

			result = results[1];
			should(result).have.property('name', { fname: 'One' });
			should(result).have.property('languages', { native: 'EN' });
			should(result).have.property('nationality', 'US');
			next();
		}
	});

	// should support join as 'fields' with multiple field matches
	it('RDPP-1053: should group multiple matches of a single field with multiple set to true in the merge metadata', function (next) {
		JoinedModel.metadata.inner_join[1].multiple = true;
		JoinedModel.fields.nationalities =  {type: Array, name: 'nationality', model: 'childModel2'};
		common.server.addModel(JoinedModel);
		JoinedModel.findAll(verifyJoin);
		function verifyJoin(err, results) {
			should(err).be.not.ok();
			should(results.length).equal(2);
			
			var result = results[0];
			should(result).have.property('name', { fname: 'Zero' });
			should(result).have.property('languages', { native: 'FR' });
			should(result).have.property('nationalities', ['CA', 'JP']);

			result = results[1];
			should(result).have.property('name', { fname: 'One' });
			should(result).have.property('languages', { native: 'EN' });
			should(result).have.property('nationalities', ['US']);
			next();
		}
	});

	// should support join as 'object'
	it('RDPP-915: should handle join as "object" correctly', function (next) {
		// if the field does not have name property it will not reference a single field from the linked
		// model with that name, and instead join as the type specified. In this case it will
		// set the whole matched result on the field as an object. 
		// NOTE: if many matches are possible, then it's not clear what will be returned from findAll.
		// ArrowDB seems to return the last registered model.
		delete JoinedModel.fields.languages.name;
		common.server.addModel(JoinedModel);
		JoinedModel.findAll(verifyJoin);
		function verifyJoin(err, results) {
			should(err).be.not.ok();
			should(results.length).be.equal(2);
			var result = results[0];
			should(result.name).be.deepEqual({fname: 'Zero'});
			should(result.languages).be.instanceof(Object);
			should(result.languages).have.property('rid', 0);
			should(result.languages).have.property('languages', {native: 'FR'});
			result = results[1];
			should(result.name).be.deepEqual({fname: 'One'});
			should(result.languages).be.instanceof(Object);
			should(result.languages).have.property('rid', 1);
			should(result.languages).have.property('languages', {native: 'EN'});
			next();	
		}
	});

	// should support join as 'array'
	it('RDPP-994: should handle join as "array" correctly', function (next) {
		// if the field does not have name property it will not reference a single field from the linked
		// model with that name, and instead join as the type specified. In this case it will
		// set all the matched results as an array
		delete JoinedModel.fields.nationality.name;
		JoinedModel.fields.nationality.type = Array;
		common.server.addModel(JoinedModel);
		JoinedModel.findAll(verifyJoin);
		function verifyJoin(err, results) {
			should(err).be.not.ok();
			should(results.length).be.equal(2);

			var result = results[0];
			should(result.name).be.deepEqual({fname: 'Zero'});
			should(result.nationality).be.instanceof(Array);
			should(result.nationality).have.length(2);
			should(result.nationality[0]).have.property('rid', 0);
			should(result.nationality[0]).have.property('nationality', 'CA');
			should(result.nationality[1]).have.property('rid', 0);
			should(result.nationality[1]).have.property('nationality', 'JP');
			result = results[1];
			should(result.name).be.deepEqual({fname: 'One'});
			should(result.nationality).be.instanceof(Array);
			should(result.nationality).have.length(1);
			should(result.nationality[0]).have.property('rid', 1);
			should(result.nationality[0]).have.property('nationality', 'US');
			next();
		}
	});
});
