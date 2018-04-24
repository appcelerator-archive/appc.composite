var should = require('should');
var utils = require('../utils')();

describe('Composite - Updating Joined Model Through Its Paired Model', function () {

	beforeEach(function (next) {
		utils.loadModelsToServer('unit', 'db-update-joined-model');
		return next();
	});

	it('[RDPP-4451-35] Should be able to update the master model via the aliased fields', function (next) {
		utils.createModelInstance('MasterModel', { rid: 0, name: 'Zero' }, function(err, mmInstance) {
			var pk = mmInstance.getPrimaryKey();
			var updatedValue = 'Bob';
			utils.server().models.AliasModel.update({ id: pk, rid: mmInstance.rid, alias: updatedValue }, findUpdatedMaster);
	
			function findUpdatedMaster(err, instance) {
				should(instance).be.Object();
				utils.server().models.MasterModel.findByID(pk, validate);
			}
	
			function validate(err, instance) {
				should(instance).be.Object();
				should(instance.rid).equal(0);
				should(instance.name).equal(updatedValue);
				return next();
			}	
		});
	});

});
