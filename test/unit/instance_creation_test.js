var should = require('should');
var async = require('async');
var utils = require('../utils')();

/**
 * Testing composite creation. There are two approaches:
 *
 * 1. explicitely create composites with specifying values
 * 2. implicitly create composites with find
 */
describe('Composite - Instance Creation', function () {

	beforeEach(function (next) {
		utils.loadModelsToServer('unit', 'db-instance-creation');
		async.series([
			function (done) {
				utils.createModelInstance('Superuser', {
					first_name: 'Dawson',
					last_name: 'Toth'
				}, done);
			},
			function (done) {
				utils.createModelInstance('Post', {
					title: 'Post Title',
					content: 'Post Content',
					author_id: utils.server().instances.Superuser[0].getPrimaryKey()
				}, done);
			}
		], next);
	});	
	
	/**
   * When not aliased setting joined field on creation throws
   */
	it('[RDPP-4451] API-354 Joined fields cannot be written to yet.', function (next) {
		var obj = {
			title: 'Article Title 0',
			content: 'Article Content 0',
			author_id: utils.server().instances.Superuser[0].getPrimaryKey(),
			first_name: 'Can not be written yet'
		};
		utils.server().models.Article.create(obj, function (err, article) {
			should(err.message).equal('API-354: Joined fields cannot be written to yet.');
			return next();
		});
	});

	/**
   * Compare this with previous one. The only difference is that the field of the composed model is aliased.
	 * When is aliased the creation of the composite model that points to existing pk "recover" the model with its relations.
	 * Should we do something here: https://techweb.axway.com/jira/browse/RDPP-4453
   */
	it('[RDPP-4451] Should not allow writing to joined models - aliased', function (next) {
		var obj = {
			title: 'Article Title 1',
			content: 'Article Content 1',
			author_id: utils.server().instances.Superuser[0].getPrimaryKey(),
			author_first_name: 'Can not be written yet'
		};
		utils.server().models.ArticleAliased.create(obj, function (err, article) {
			should(article).be.an.Object();
			should(article.getPrimaryKey()).be.ok();
			should(article.title).equal(obj.title);
			should(article.content).equal(obj.content);
			// Does not throw but connects to the relation and ignored the dummy value.
			should(article.author_first_name).equal(utils.server().instances.Superuser[0].first_name);	
			return next();
		});
	});

	it('[RDPP-4451] Badly joined fields affects the proper creation of the model instance', function (next) {
		utils.server().models.BadJoin.find(function (err, article) {
			should(article.getPrimaryKey).be.not.ok();
			return next();
		});
	});

	it('[RDPP-4451] Should warn when joined on a bad model', function (next) {
		utils.server().models.BadModel.findAll(function (err) {
			should(err).be.ok();
			should(String(err)).containEql('Unable to find model i_dont_exist');
			next();
		});
	});

});
