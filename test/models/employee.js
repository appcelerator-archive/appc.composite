module.exports = function(APIBuilder) {
	return APIBuilder.Model.extend('employee', {
		fields: {
			first_name: { type: String },
			last_name: { type: String },
			email_address: { type: String },
			phone_number: { type: String },
			home_address: { type: String }
		},
		connector: 'appc.mysql',

		metadata: {
			'appc.mysql': {
				table: 'nolan_user'
			}
		}
	});
};