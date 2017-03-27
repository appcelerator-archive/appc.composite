var should = require('should'),
	async = require('async'),
	common = require('./common'),
	Arrow = common.Arrow;

describe('Create / Update / Delete', function () {

	var Models = common.Models,
		IDs = common.IDs;

	it('should be able to create instance', function (next) {

		var obj = {
			title: 'Test Title',
			content: 'Test Content',
			author_id: IDs.user,
			attachment_id: IDs.attachment
		};
		Models.article.create(obj, function (err, instance) {
			should(err).be.not.ok();
			should(instance).be.an.Object();
			should(instance.getPrimaryKey()).be.ok();
			should(instance.title).equal(obj.title);
			should(instance.content).equal(obj.content);
			should(instance.author_first_name).equal('Dawson');
			should(instance.author_last_name).equal('Toth');
			should(instance.attachment_content).equal('Test Attachment Content');
			next();
		});

	});

	it('should be able to update an instance', function (next) {

		var obj = {
			title: 'Test Title',
			content: 'Test Content',
			author_id: IDs.user,
			attachment_id: IDs.attachment
		};

		Models.article.create(obj, function (err, instance) {
			should(err).be.not.ok();
			should(instance).be.an.Object();
			var id = instance.getPrimaryKey();
			instance.set('content', 'Goodbye world');
			instance.save(function (err, result) {
				should(err).be.not.ok();
				should(result).be.an.Object();
				should(result.getPrimaryKey()).equal(id);
				should(result.title).equal(obj.title);
				should(result.content).equal('Goodbye world');
				should(result.author_first_name).equal('Dawson');
				should(result.author_last_name).equal('Toth');
				next();
			});
		});

	});

	it.skip('should be able to delete an instance', function (next) {

		var obj = {
			title: 'Test Title',
			content: 'Test Content',
			author_id: IDs.user,
			attachment_id: IDs.attachment
		};

		Models.article.create(obj, function (err, instance) {
			should(err).be.not.ok();
			should(instance).be.an.Object();
			var id = instance.getPrimaryKey();

			instance.remove(function (err, result) {
				should(err).be.not.ok();

				Models.article.findByID(id, function (err, result) {
					should(err).be.not.ok();
					should(result).be.not.ok();
					next();
				});
			});
		});

	});

	it('should not allow writing to joined models (for now)', function (next) {
		var ExampleModel = Arrow.Model.extend('article', {
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
		ExampleModel.create({ first_name: 'cant be written just yet' }, function (err, instance) {
			should(err).be.ok();
			next();
		});
	});

	it('should be able to update a model with aliased fields', function (done) {
		// Base model that will be aliased.
		var MasterModel = Arrow.Model.extend(
			'rdpp487MasterModel', {
				fields: {
					rid: {type: Number},
					name: {type: String}
				},
				connector: 'memory'
			});
		common.server.addModel(MasterModel);

		// Alias model - name aliased to 'alias'
		var AliasModel = Arrow.Model.extend('rdpp487AliasModel', {
			fields: {
				rid: {type: Number, model: 'rdpp487MasterModel'},
				alias: {type: String, model: 'rdpp487MasterModel', name: 'name'}
			},
			connector: 'appc.composite'
		});
		common.server.addModel(AliasModel);

		// Create test data and update once created.
		MasterModel.create([{rid: 0, name: 'Zero'}, {rid: 1, name: 'One'}], updateTestAlias);

		function updateTestAlias(err, instances) {
			if (err) {
				done(err);
				return;
			}
			AliasModel.update({ id: instances[0].id, rid: instances[0].rid, alias: 'Bob' }, findAll);
		}

		function findAll(err, instance) {
			if (err) {
				done(err);
				return;
			}
			MasterModel.findAll(verifyUpdate);
		}
		function verifyUpdate(err, instances) {
			if (err) {
				done(err);
				return;
			}

			should(instances).have.length(2);
			should(instances[0].rid).equal(0);
			should(instances[0].name).equal('Bob');
			should(instances[1].rid).equal(1);
			should(instances[1].name).equal('One');
			done();
		}
	});

});
