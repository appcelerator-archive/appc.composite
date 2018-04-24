var should = require('should');
var async = require('async');
var utils = require('../utils')();

describe('Composite - Quering', function() {

	beforeEach(function (next) {
		utils.loadModelsToServer('unit', 'db-query');
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
			},
			function (done) {
				utils.createModelInstance('Article', {
					title: 'Main Article',
					content: 'Main Article Content',
					author_id: utils.server().instances.Superuser[0].getPrimaryKey(),
					attachment_id: utils.server().instances.Attachment[0].getPrimaryKey()
				}, done);
			}			
		], next);
	});	

	it('[RDPP-4451] Should be able to query', function (next) {
		var options = {
			where: { content: 'Main Article Content' }
		};
		utils.server().models.Article.query(options, function (err, articles) {
			should(articles).have.length(1);
			should(articles[0].content === utils.server().instances.Article[0].content);
			next();
		});
	});

	it('[RDPP-4451] Should return no results when query with invalid where', function (next) {
		var options = { where: { content: 'bad' } };
		utils.server().models.Article.query(options, function (err, articles) {
			should(articles).have.length(0);
			next();
		});
	});

	it('[RDPP-4451] API 354. Joined fields cannot be queried on yet', function (next) {
		utils.server().models.Article.query({ where: { author_first_name: 'cant be queried on just yet' } }, function (err) {
			should(err).be.ok();
			should(String(err)).containEql('Joined fields cannot be queried on yet');
			next();
		});
	});

	it('[RDPP-4451] Should be able to query via aliased fields - exact value in where caluse', function () {
		async.series([
			function (done) {
				utils.createModelInstance('Employee',{ first_name: 'Fred' }, done);
			},
			function (done) {
				utils.createModelInstance('Employee',{ first_name: 'Frederick' }, done);
			},
			function (done) {
				utils.createModelInstance('Employee',{ first_name: 'John' }, done);
			},
			function (done) {
				utils.createModelInstance('EmployeeManager',{ manager_name: 'Phill', employee_id: utils.server().instances.Employee[0].getPrimaryKey() }, done);
			},
			function (done) {
				utils.createModelInstance('EmployeeManager',{ manager_name: 'Kevin', employee_id: utils.server().instances.Employee[1].getPrimaryKey() },done);
			},
			function (done) {				 
				utils.createModelInstance('EmployeeManager',{ manager_name: 'Michael', employee_id: utils.server().instances.Employee[2].getPrimaryKey() }, done);
			},
			function (done) {
				utils.createModelInstance('EmployeeHabit', { habit: 'lazy', employee_id: utils.server().instances.Employee[0].getPrimaryKey() }, done);
			},
			function (done) {
				utils.createModelInstance('EmployeeHabit', { habit: 'eat chocolate', employee_id: utils.server().instances.Employee[0].getPrimaryKey() }, done);
			},
			function (done) {
				utils.createModelInstance('EmployeeHabit', { habit: 'workaholic', employee_id: utils.server().instances.Employee[1].getPrimaryKey() }, done);
			},
			function (done) {
				utils.createModelInstance('EmployeeHabit', { habit: 'drink tea', employee_id: utils.server().instances.Employee[1].getPrimaryKey() }, done);
			},																											
		], run);		

		function run() {
			var fred = utils.server().instances.Employee[0];
			var phill = utils.server().instances.EmployeeManager[0];
			utils.server().models.Emp.query({
				where: { fname: 'Fred' }
			}, function (err, results) {
				should(results.length).equal(1);
				should(results[0].fname).equal(fred.first_name);
				should(results[0].manager).equal(phill.manager_name);
				should(results[0].habit.length).equal(2);
			});	
		}
	});

});

