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

	it('should be able to update an instance', function (next) {

		var obj = {
			title: 'Test Title',
			content: 'Test Content',
			author_id: IDs.user,
			attachment_id: IDs.attachment
		};

		Models.article.create(obj, function (err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.Object;
			var id = instance.getPrimaryKey();
			instance.set('content', 'Goodbye world');
			instance.save(function (err, result) {
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

	it('should be able to delete an instance', function (next) {

		var obj = {
			title: 'Test Title',
			content: 'Test Content',
			author_id: IDs.user,
			attachment_id: IDs.attachment
		};

		Models.article.create(obj, function (err, instance) {
			should(err).be.not.ok;
			should(instance).be.an.Object;
			var id = instance.getPrimaryKey();

			instance.remove(function (err, result) {
				should(err).be.not.ok;

				Models.article.findByID(id, function (err, result) {
					should(err).be.not.ok;
					should(result).be.not.ok;
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
			should(err).be.ok;
			next();
		});
	});

});