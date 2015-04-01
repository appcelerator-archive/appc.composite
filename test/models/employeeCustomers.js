module.exports = function (Arrow) {
	return Arrow.createModel('employeeCustomers', {
		fields: {
			first_name: {
				model: 'appc.mysql/user',
				type: 'string'
			},
			last_name: {
				model: 'appc.mysql/user',
				type: 'string'
			},/*
			habit: {
				model: 'appc.mysql/employee_habit',
				type: Array
			},*/
			assigned: {
				model: 'customer',
				type: Array
			}
		},
		connector: 'appc.composite',
		metadata: {
			left_join: [/*
				{
					model: 'appc.mysql/employee_habit',
					multiple: true,
					join_properties: {
						employee_id: 'id'
					}
				},*/
				{
					model: 'customer',
					
					join_properties: {
						assignedTo: 'id'
					}
				}
			]
		},
		singular: 'employee',
		plural: 'employees'
	});
};