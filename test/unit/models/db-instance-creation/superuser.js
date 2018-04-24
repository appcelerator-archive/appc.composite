module.exports = function (Arrow) {
	return Arrow.Model.extend('Superuser', {
		fields: {
			first_name: { type: String, required: true },
			last_name: { type: String, required: true }
		},
		connector: 'memory'
	});
};
