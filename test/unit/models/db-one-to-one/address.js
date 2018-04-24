module.exports = function (Arrow) {
	return Arrow.Model.extend('Address', {
		fields: {
			street: { type: String },
			number: { type: Number },
			customerId: { type: Number }
		},
		connector: 'memory'
	});
};
