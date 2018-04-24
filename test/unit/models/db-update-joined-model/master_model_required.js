module.exports = function (Arrow) {
	return Arrow.Model.extend('MasterModelRequired', {
		fields: {
			rid: { type: Number, required: true },
			name: { type: String, required: true }
		},
		connector: 'memory'
	});
};
