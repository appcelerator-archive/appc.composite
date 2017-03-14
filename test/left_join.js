var should = require('should'),
	async = require('async'),
	common = require('./common'),
	Arrow = common.Arrow;

describe('Left Join', function () {

	var Models = common.Models,
		IDs = common.IDs;

	it('should warn when joined on a bad model', function (next) {
		var ExampleModel = Arrow.Model.extend('bad_model_query_example', {
			fields: {
				title: {type: String, model: 'i_dont_exist'},
				author_id: {type: Number, model: 'i_dont_exist'},
				first_name: {type: String, model: 'user'}
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
		ExampleModel.findAll(function (err) {
			should(err).be.ok;
			should(String(err)).containEql('Unable to find model i_dont_exist');
			next();
		});
	});

	it('API-565: should translate named fields in queries', function (next) {
		Models.emp.query({
			where: {
				fname: {$like: 'Fre%'}
			}
		}, function (err, results) {
			should(err).be.not.ok;
			should(results).be.ok;
			should(results.length).be.greaterThan(0);
			next();
		});
	});

	it('API-284: should handle left join when right can be null', function (next) {

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

		Models.article.create(objs, function (err, coll) {
			should(err).be.not.ok;
			should(coll.length).equal(objs.length);

			Models.article.find(function (err, coll2) {
				should(err).be.not.ok;
				should(coll2.length).be.greaterThan(coll.length - 1);

				async.eachSeries(coll2, function (post, cb) {
					should(post).be.an.Object;
					if (!post.author_id) {
						should(post.author_first_name).be.not.ok;
						should(post.author_last_name).be.not.ok;
					}
					if (!post.attachment_id) {
						should(post.attachment_content).be.not.ok;
					}
					cb();
				}, function (err) {
					next(err);
				});
			});

		});

	});

	it('API-933: should pull in fields and whole objects from joined models', function (next) {

		var objs = [
			{
				title: 'Test Title 1',
				content: 'Test Content 1',
				author_id: IDs.user
			}
		];

		Models.articleEmbedded.create(objs, function (err, coll) {
			should(err).be.not.ok;
			should(coll.length).equal(objs.length);

			Models.articleEmbedded.find(function (err, coll2) {
				should(err).be.not.ok;
				should(coll2.length).be.greaterThan(coll.length - 1);

				async.eachSeries(coll2, function (post, cb) {
					should(post).be.an.Object;
					if (post.author_id > 0) {
						should(post.author_first_name).be.ok;
						should(post.author).be.ok;
					}
					cb();
				}, function (err) {
					next(err);
				});
			});

		});

	});

	it('API-933: should pull in fields and whole objects from source models', function (next) {

		var Author = Arrow.createModel('author', {
				fields: {
					first_name: {type: String},
					author_id: {type: String}
				},
				connector: 'memory'
			}),
			Book = Arrow.createModel('book', {
				fields: {
					title: {type: String},
					genre: {type: String},
					isbn: {type: String},
					author_id: {type: String}
				},
				connector: 'memory'
			}),
			Library = Arrow.createModel('library', {
				fields: {
					first_name: {model: 'author', type: String},
					title: {model: 'book', type: String},
					book_info: {model: 'book', type: Object}
				},
				connector: 'appc.composite',
				metadata: {
					left_join: [
						{
							model: 'author',
							join_properties: {
								author_id: 'author_id'
							}
						}
					]
				}
			});

		common.server.addModel(Author);
		common.server.addModel(Book);
		common.server.addModel(Library);

		Author.create([
			{first_name: 'Wilson', author_id: 'w1'},
			{first_name: 'Dawson', author_id: 'd2'}
		]);
		Book.create([
			{title: 'The Life of Wilson', genre: 'biography', isbn: '123456732', author_id: 'w1'},
			{title: 'Lessons in Failing [Tests]', genre: 'technology', isbn: '309183406', author_id: 'w1'},
			{title: 'Writing Tests that Suck', genre: 'technology', isbn: '6206929406', author_id: 'd2'}
		]);

		Library.findAll(function (err, results) {
			should(err).be.not.ok;
			for (var i = 0; i < results.length; i++) {
				var result = results[i];
				should(result.first_name).be.ok;
				should(result.book_info.title).equal(result.title);
			}
			next();
		});
	});

	it('API-283: API-351: should allow 0-1-many joins', function (next) {
		Models.employee.deleteAll(function (err) {
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
			], function (err, coll) {
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
				], function (err, coll) {
					should(err).be.not.ok;
					should(coll.length).equal(3);

					Models.employee_habit.findAll(function (err, coll) {
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

	it('API-805: should ignore custom fields', function (next) {
		var MasterModel = Arrow.Model.extend('masterModel805', {
				fields: {rid: {type: Number}, name: {type: String}},
				connector: 'memory'
			}),
			ChildModel = Arrow.Model.extend('childModel805', {
				fields: {rid: {type: Number}, age: {type: String}},
				connector: 'memory'
			});
		common.server.addModel(MasterModel);
		common.server.addModel(ChildModel);

		var JoinedModel = Arrow.Model.extend('joinedMasterChildModel805', {
			fields: {
				rid: {type: Number, model: 'masterModel805'},
				name: {type: String, model: 'masterModel805'},
				age: {type: String, model: 'childModel805'},
				customField: {type: String, custom: true}
			},
			connector: 'appc.composite',

			metadata: {
				'appc.composite': {
					left_join: {
						model: 'childModel805',
						join_properties: {
							rid: 'rid'
						}
					}
				}
			}
		});
		common.server.addModel(JoinedModel);

		MasterModel.create([{rid: 0, name: 'Zero'}, {rid: 1, name: 'One'}], createChildren);

		function createChildren(err) {
			should(err).be.not.ok;
			ChildModel.create([{rid: 0, age: '24'}, {rid: 1, age: '39'}], testJoin);
		}

		function testJoin(err) {
			should(err).be.not.ok;
			JoinedModel.findAll(verifyJoin);
		}

		function verifyJoin(err, results) {
			should(err).be.not.ok;
			should(results.length).be.ok;
			for (var i = 0; i < results.length; i++) {
				var result = results[i];
				should(result.name).be.ok;
				should(result.age).be.ok;
			}
			next();
		}
	});

	// model fields containing 'name' should not be considered for join
	it('RDPP-888: should handle joined field correctly', function (next) {
		var MasterModel = Arrow.Model.extend('masterModel888', {
				fields: {rid: {type: Number}, name: {type: Object}},
				connector: 'memory'
			}),
			ChildModel = Arrow.Model.extend('childModel888', {
				fields: {rid: {type: Number}, languages: {type: Array}},
				connector: 'memory'
			});
		common.server.addModel(MasterModel);
		common.server.addModel(ChildModel);

		var JoinedModel = Arrow.Model.extend('joinedMasterChildModel888', {
			fields: {
				rid: {type: Number, name: 'rid', model: 'masterModel888'},
				name: {type: Object, name: 'name', model: 'masterModel888'},
				languages: {type: Array, model: 'childModel888'}
			},
			connector: 'appc.composite',

			metadata: {
				'appc.composite': {
					left_join: {
						model: 'childModel888',
						join_properties: {
							rid: 'rid'
						}
					}
				}
			}
		});
		common.server.addModel(JoinedModel);

		MasterModel.create([{rid: 0, name: {first: 'Zero'}}, {rid: 1, name: {fist: 'One'}}], createChildren);

		function createChildren(err) {
			should(err).be.not.ok;
			ChildModel.create([{rid: 0, languages: ['eng']}, {rid: 1, languages: ['fre']}], testJoin);
		}

		function testJoin(err) {
			should(err).be.not.ok;
			var jm = JoinedModel.findAll(() => {})
			JoinedModel.findAll(verifyJoin);
		}

		function verifyJoin(err, results) {
			should(err).be.not.ok;
			should(results.length).eql(2);
			should(results[0].languages.length).eql(2);
			should(results[1].languages.length).eql(2);
			next();
		}
	});

	it('API-710: should allow joining when the joined value is 0', function (next) {
		var MasterModel = Arrow.Model.extend('masterModel', {
				fields: {rid: {type: Number}, name: {type: String}},
				connector: 'memory'
			}),
			ChildModel = Arrow.Model.extend('childModel', {
				fields: {rid: {type: Number}, age: {type: String}},
				connector: 'memory'
			});
		common.server.addModel(MasterModel);
		common.server.addModel(ChildModel);

		var JoinedModel = Arrow.Model.extend('joinedMasterChildModel', {
			fields: {
				rid: {type: Number, model: 'masterModel'},
				name: {type: String, model: 'masterModel'},
				age: {type: String, model: 'childModel'}
			},
			connector: 'appc.composite',

			metadata: {
				'appc.composite': {
					left_join: {
						model: 'childModel',
						join_properties: {
							rid: 'rid'
						}
					}
				}
			}
		});
		common.server.addModel(JoinedModel);

		MasterModel.create([{rid: 0, name: 'Zero'}, {rid: 1, name: 'One'}], createChildren);

		function createChildren(err) {
			should(err).be.not.ok;
			ChildModel.create([{rid: 0, age: '24'}, {rid: 1, age: '39'}], testJoin);
		}

		function testJoin(err) {
			should(err).be.not.ok;
			JoinedModel.findAll(verifyJoin);
		}

		function verifyJoin(err, results) {
			should(err).be.not.ok;
			should(results.length).be.ok;
			for (var i = 0; i < results.length; i++) {
				var result = results[i];
				should(result.name).be.ok;
				should(result.age).be.ok;
			}
			next();
		}
	});

});
