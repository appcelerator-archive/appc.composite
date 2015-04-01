module.exports = function (Arrow) {
	return Arrow.createModel('customer', {
		fields: {
			name: {
				type: 'String'
			},
			assignedTo: {
				type: 'Number'
			},
			email: {
				type: 'String'
			},
			phone: {
				type: 'String'
			},
			notes: {
				type: 'String'
			}
		},
		connector: 'appc.arrowdb',
		actions: [
			'create',
			'read',
			'update',
			'delete',
			'deleteAll'
		],
		singular: 'customer',
		plural: 'customers'
	});
};