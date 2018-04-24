module.exports = function (Arrow) {
	return Arrow.createModel('emp', {
		fields: {
			fname: { type: String, name: 'first_name', description: 'First name', model: 'appc.mysql/n1_employee' },
			manager: {
				type: String,
				name: 'manager_name',
				description: 'manager of employee',
				model: 'appc.mysql/n1_employee_manager'
			},
			habit: { type: Array, description: 'Habit of employee', model: 'appc.mysql/n1_employee_habit' }

		},
		connector: 'appc.composite',
		metadata: {
			left_join: [
				{
					model: 'appc.mysql/n1_employee_manager',
					join_properties: {
						'employee_id': 'id'
					}
				},
				{
					model: 'appc.mysql/n1_employee_habit',
					multiple: true,
					join_properties: {
						'employee_id': 'id'
					}
				}
			]
		}
	});
};