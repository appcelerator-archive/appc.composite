module.exports = function (Arrow) {
	return Arrow.Model.extend('Customer', {
		fields: {
			name: { type: String }
		},
		connector: 'memory'
	});
};
