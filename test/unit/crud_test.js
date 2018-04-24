var should = require('should');
var async = require('async');
var utils = require('../utils')();

describe('Composite - CRUD', function () {

	beforeEach(function (next) {
		utils.loadModelsToServer('unit', 'db-crud');
		async.series([
			function (done) {
				utils.createModelInstance('Superuser', {
					first_name: 'Dawson',
					last_name: 'Toth'
				}, done);
			},
			function (done) {
				utils.createModelInstance('Attachment', {
					attachment_content: 'Test Attachment Content'
				}, done);
			},
			function (done) {
				utils.createModelInstance('Post', {
					title: 'Post Title',
					content: 'Post Content',
					author_id: utils.server().instances.Superuser[0].getPrimaryKey(),
					attachment_id: utils.server().instances.Attachment[0].getPrimaryKey()
				}, done);
			}
		], next);
	});	

	it('[RDPP-4451-2] Should be able to find an instance by ID', function (next) {
		var obj = {
			title: 'Article Title 0',
			content: 'Article Content 0',
			author_id: utils.server().instances.Superuser[0].getPrimaryKey(),
			attachment_id: utils.server().instances.Attachment[0].getPrimaryKey()
		};
		utils.server().models.Article.create(obj, function (err, article) {
				utils.addInstance('Article', article);
				var pk = article.getPrimaryKey();
				utils.server().models.Article.findByID(pk, function (err, foundArticle) {
					should(err).be.not.ok();
					should(foundArticle).be.an.Object();
					should(foundArticle.getPrimaryKey()).equal(pk);
					should(foundArticle.title).equal(article.title);
					should(foundArticle.content).equal(article.content);
					should(foundArticle.author_first_name).equal(article.author_first_name);
					should(foundArticle.author_last_name).equal(article.author_last_name);
					should(foundArticle.attachment_content).equal(article.attachment_content);
					return next();
				});
		});
	});

	it('[RDPP-4451-1] Should be able to find all instances', function (next) {
		utils.server().models.Article.find(function (err, articles) {
			should(articles.length === 1);
			return next();
		});
	});

	it('[RDPP-4451-3] API-710: Should be able to find when the joined value is 0', function (next) {
		utils.server().models.MasterModel.create([{ rid: 0, name: 'Zero' }, { rid: 1, name: 'One' }], function (err, instance) {
			utils.addInstance('MasterModel', instance);
			utils.server().models.ChildModel.create([{ rid: 0, age: '24' }, { rid: 1, age: '39' }], function (err, instance) {
				utils.addInstance('ChildModel', instance);
				utils.server().models.JoinedModel.findAll(function (err, results) {
					should(results.length).equal(2);
					return next();
				});						
			});
		});
	});

	it('[RDPP-4451-4] Should be able to CRUD composite instance joining 3 models', function () {
		var obj = {
			title: 'Article Title 0',
			content: 'Article Content 0',
			author_id: utils.server().instances.Superuser[0].getPrimaryKey(),
			attachment_id: utils.server().instances.Attachment[0].getPrimaryKey()
		};
		utils.server().models.Article.create(obj, function (err, article) {
			should(article).be.an.Object();
			should(article.getPrimaryKey()).be.ok();
			should(article.title).equal(obj.title);
			should(article.content).equal(obj.content);
			should(article.author_first_name).equal(utils.server().instances.Superuser[0].first_name);
			should(article.author_last_name).equal(utils.server().instances.Superuser[0].last_name);
			should(article.attachment_content).equal(utils.server().instances.Attachment[0].attachment_content);
	
			var message = 'Goodbye world';
			article.set('content', message);
			article.save(function (err, result) {
				should(err).be.not.ok();
				should(result).be.an.Object();
				should(result.getPrimaryKey()).equal(article.getPrimaryKey());
				should(result.content).equal(message);
	
				article.remove(function (err, result) {
					should(err).be.not.ok();
					should(result).be.ok();
					should(result.getPrimaryKey()).equal(article.getPrimaryKey());
					should(result._deleted).be.ok();
					utils.server().models.Article.findByID(article.getPrimaryKey(), function (err, result) {
						should(err).be.not.ok();
						should(result).be.not.ok();
					});
				});
			});	
		});
	});

});
