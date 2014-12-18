module.exports = function(APIBuilder) {
	return APIBuilder.Model.extend('employeeHabit', {
		fields: {
			fname: { type: String, description: 'First name', name: 'first_name' },
			lname: { type: String, description: 'Last name', name: 'last_name' },
			email: { type: String, description: 'Email address', name: 'email_address' },
			habit: { type: Array, description: 'Employee bad habits' }
		},
		connector: 'appc.composite',
		metadata: {
			'appc.composite': {
				models: [
					{
						name: 'employee'
					},
					{
						name: 'habit',
						readonly: true,
						multiple: true,
						left_join: {
							'user_id': 'id'
						}
					}
				]
			}
		}
	});
};