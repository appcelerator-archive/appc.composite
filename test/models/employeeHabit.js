module.exports = function(APIBuilder) {
	return APIBuilder.Model.extend('employeeHabit', {
		fields: {
			fname: { type: String, description: 'First name', name: 'first_name', cmodel: 'employee' },
			lname: { type: String, description: 'Last name', name: 'last_name', cmodel: 'employee' },
			email: { type: String, description: 'Email address', name: 'email_address', cmodel: 'employee' },
			habit: { type: Array, description: 'Employee bad habits', cmodel: 'habit' }
		},
		connector: 'appc.composite',
		metadata: {
			'appc.composite': {
				left_join: { // there would be a property for each join type
					model: 'habit',
					readonly: true,
					multiple: true,
					join_properties: {
						'user_id': 'id'
					}
				}
			}
		}
	});
};