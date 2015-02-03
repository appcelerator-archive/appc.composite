var should = require('should'),
	async = require('async'),
	common = require('./common'),
	Arrow = common.Arrow;

describe('Inner Join', function() {

	var Models = common.Models,
		IDs = common.IDs;

	it('API-285: should support inner join', function(next) {

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

		Models.article.create(objs, function(err, coll) {
			should(err).be.not.ok;
			should(coll.length).equal(objs.length);

			Models.authored_article.find(function(err, coll2) {
				should(err).be.not.ok;
				should(coll2.length).be.greaterThan(1);

				async.eachSeries(coll2, function(post, cb) {
					should(post).be.an.Object;
					should(post.author_id).be.ok;
					should(post.author_first_name).be.ok;
					should(post.author_last_name).be.ok;
					cb();
				}, function(err) {
					next(err);
				});
			});

		});

	});

});