module.exports = function(APIBuilder) {
	return APIBuilder.Model.extend('user', {
		fields: {
			first_name: { type: String },
			last_name: { type: String }
		},
		connector: 'appc.mysql'
	});
};