module.exports = function (Arrow) {
	return Arrow.Model.extend('Emp', {
		fields: {
			fname: { type: String, name: 'first_name', description: 'First name', model: 'Employee' },
			manager: { type: String, name: 'manager_name', description: 'manager of employee', model: 'EmployeeManager' },
			habit: { type: Array, description: 'Habit of employee', model: 'EmployeeHabit' }
		},
		connector: 'composite',
		metadata: {
			left_join: [
				{
					model: 'EmployeeManager',
					join_properties: {
						employee_id: 'id'
					}
				},
				{
					model: 'EmployeeHabit',
					multiple: true,
					join_properties: {
						employee_id: 'id'
					}
				}
			]
		}
	});
};
