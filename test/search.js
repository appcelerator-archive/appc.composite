var should = require('should'),
	async = require('async'),
	common = require('./common'),
	APIBuilder = common.APIBuilder;

describe('Find / Query', function() {

	var Models = common.Models,
		IDs = common.IDs;

	it('should be able to find an instance by ID', function(next) {

		var obj = {
			title: 'Test Title',
			content: 'Test Content',
			author_id: IDs.user,
			attachment_id: IDs.attachment
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

	it('should be able to query', function(callback) {

		var obj = {
			title: 'Test Title',
			content: 'Test Content',
			author_id: IDs.user,
			attachment_id: IDs.attachment
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
				author_id: IDs.user,
				attachment_id: IDs.attachment
			},
			{
				title: 'Test Title 2',
				content: 'Test Content 2',
				author_id: IDs.user,
				attachment_id: IDs.attachment
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
							bad_id: 'author_id'
						}
					}
				}
			}
		});
		BadJoinedFieldModel.findOne(IDs.post, function(err, instance) {
			should(err).be.not.ok;
			should(instance.author_id).be.ok;
			should(instance.author_first_name).be.not.ok;
			should(instance.author_last_name).be.not.ok;
			next();
		});
	});

	it('should not allow querying on joined models (for now)', function(next) {
		var ExampleModel = APIBuilder.Model.extend('dont_allow_querying_example', {
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
							id: 'author_id'
						}
					}
				}
			}
		});
		ExampleModel.query({ first_name: 'cant be queried on just yet' }, function(err) {
			should(err).be.ok;
			should(String(err)).containEql('Joined fields cannot be queried on yet');
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

});