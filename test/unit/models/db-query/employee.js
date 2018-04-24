module.exports = function (Arrow) {
	return Arrow.Model.extend('Employee', {
		fields: {
			first_name: { type: String, required: true }
		},
		connector: 'memory'
	});
};
