var should = require('should');
var async = require('async');
var utils = require('../utils')();

describe('Composite - Selection', function () {
	
	beforeEach(function (next) {
		utils.loadModelsToServer('unit', 'db-selection');
		utils.createModelInstance('Superuser', {
			first_name: 'Michael',
			last_name: 'Jordan',
			nickname: 'MJ',
			mobile: '123',
			email: 'mj@chicago.com'
		}, next);		
	});

	it('[RDPP-4451] Selection + Alias', function (next) {
		var originalModel = utils.server().instances.Superuser[0];
		utils.server().models.ReducedSuperuser.find(validate);

		function validate(err, result) {
			should(result.length).equal(1);
			should(result[0].first_name).equal(originalModel.first_name);
			should(result[0].lname).equal(originalModel.last_name);
			should(result[0].email).equal(originalModel.email);
			should(result[0].mobile).be.not.ok();
			should(result[0].last_name).be.not.ok();
			should(result[0].nickname).be.not.ok();
			next();
		}
	});

});
