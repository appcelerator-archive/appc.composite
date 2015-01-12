module.exports = function(APIBuilder) {
	return APIBuilder.createModel('uc_9a', {
		fields: {
			employees: { type: Array, collection: 'appc.mysql/Composite_UserTable' },
			teams: { type: Array, collection: 'appc.mssql/trees' },
			cities: { type: Array, collection: 'appc.mongo/uc_8' },
			accounts: { type: Array, collection: 'appc.salesforce/Account' }
		},
		connector: 'appc.composite'
	});
};
