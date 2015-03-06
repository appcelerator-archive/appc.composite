module.exports = function (Arrow) {
	return Arrow.createModel('multijoin', {
		fields: {
			employees: { type: Array, description: 'employees', model: 'appc.mysql/n1_employee' },
			teams: { type: Array, description: 'teams', model: 'appc.mssql/team' },
			cities: { type: Array, description: 'cities', model: 'city' },
			accounts: { type: Array, description: 'accounts', model: 'appc.salesforce/Account' },
			cars: { type: Array, description: 'cars', model: 'car' }

		},
		connector: 'appc.composite'
	});
};