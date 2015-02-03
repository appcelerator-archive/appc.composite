var should = require('should'),
	async = require('async'),
	common = require('./common'),
	Arrow = common.Arrow;

describe('Left Join', function() {

	var Models = common.Models,
		IDs = common.IDs;

	it('should warn when joined on a bad model', function(next) {
		var ExampleModel = Arrow.Model.extend('bad_model_query_example', {
			fields: {
				title: { type: String, model: 'i_dont_exist' },
				author_id: { type: Number, model: 'i_dont_exist' },
				first_name: { type: String, model: 'user' }
			},
			connector: 'appc.composite',

			metadata: {
				'appc.composite': {
					left_join: {
						model: 'i_dont_exist',
						join_properties: {
							id: 'author_id'
						}
					}
				}
			}
		});
		ExampleModel.findAll(function(err) {
			should(err).be.ok;
			should(String(err)).containEql('Unable to find model i_dont_exist');
			next();
		});
	});

	it('API-284: should handle left join when right can be null', function(next) {

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

		Models.article.create(objs, function(err, coll) {
			should(err).be.not.ok;
			should(coll.length).equal(objs.length);

			Models.article.find(function(err, coll2) {
				should(err).be.not.ok;
				should(coll2.length).be.greaterThan(coll.length - 1);

				async.eachSeries(coll2, function(post, cb) {
					should(post).be.an.Object;
					if (!post.author_id) {
						should(post.author_first_name).be.not.ok;
						should(post.author_last_name).be.not.ok;
					}
					if (!post.attachment_id) {
						should(post.attachment_content).be.not.ok;
					}
					cb();
				}, function(err) {
					next(err);
				});
			});

		});

	});

	it('API-283: API-351: should allow 0-1-many joins', function(next) {
		Models.employee.deleteAll(function(err) {
			should(err).be.not.ok;
			Models.employee.create([
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

				Models.habit.create([
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

					Models.employee_habit.findAll(function(err, coll) {
						should(err).be.not.ok;
						should(coll.length).equal(1);
						should(coll[0].habit).be.ok;
						should(coll[0].habit.length).equal(3);
						should(coll[0].fname).be.ok;
						next();
					});
				});

			});
		});
	});

});