module.exports = function (Arrow) {
	return Arrow.Model.extend('Author', {
		fields: {
			first_name: { type: String, required: true },
			last_name: { type: String, required: true },
			nickname: { type: String, required: false },
			email: { type: String, required: true },
			mobile: { type: String, required: false }
		},
		connector: 'memory'
	});
};
