module.exports = function (Arrow) {
	return Arrow.Model.extend('employee_habit', {
		fields: {
			fname: { type: String, description: 'First name', name: 'first_name', model: 'appc.mysql/nolan_user' },
			lname: { type: String, description: 'Last name', name: 'last_name', model: 'appc.mysql/nolan_user' },
			email: {
				type: String,
				description: 'Email address',
				name: 'email_address',
				model: 'appc.mysql/nolan_user'
			},
			habit: { type: Array, description: 'Employee bad habits', model: 'appc.mysql/nolan_user_bad_habits' }
		},
		connector: 'appc.composite',
		metadata: {
			'appc.composite': {
				inner_join: {
					model: 'appc.mysql/nolan_user_bad_habits',
					join_properties: {
						user_id: 'id'
					}
				}
			}
		}
	});
};
