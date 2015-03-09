module.exports = function (Arrow) {
	return Arrow.Model.extend('user', {
		fields: {
			first_name: { type: String },
			last_name: { type: String }
		},
		connector: 'appc.mysql',

		metadata: {
			'appc.mysql': {
				table: 'Composite_UserTable'
			}
		}
	});
};