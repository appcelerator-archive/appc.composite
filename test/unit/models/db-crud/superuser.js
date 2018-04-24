module.exports = function (Arrow) {
	return Arrow.Model.extend('Superuser', {
		fields: {
			first_name: { type: String, required: true },
			last_name: { type: String, required: true },
			nickname: { type: String, required: false },
			email: { type: String, required: false },
			mobile: { type: String, required: false }
		},
		connector: 'memory'
	});
};
