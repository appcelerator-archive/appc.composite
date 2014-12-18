module.exports = function(APIBuilder) {
	return APIBuilder.Model.extend('habit', {
		fields: {
			user_id: { type: Number },
			habit: { type: String }
		},
		connector: 'appc.mysql',

		metadata: {
			'appc.mysql': {
				table: 'nolan_user_bad_habits'
			}
		}
	});
};