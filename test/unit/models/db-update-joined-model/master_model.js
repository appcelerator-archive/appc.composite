module.exports = function (Arrow) {
	return Arrow.Model.extend('MasterModel', {
		fields: {
			rid: { type: Number, required: true },
			name: { type: String }
		},
		connector: 'memory'
	});
};
