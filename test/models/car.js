module.exports = function (Arrow) {
	return Arrow.createModel('car', {
		fields: {
			make: { type: String, description: 'the make of a car ' },
			model: { type: String, description: 'the model of the car', required: true },
			year: { type: Number, description: 'year the car was made', required: true },
			bluebook: { type: Number, description: 'kelly bluebook value of the car', required: true },
			mileage: { type: Number, description: 'current mileage of the car', required: true },
			longname: {
				type: String, custom: true,
				get: function (val, key, model) {
					return model.get('year') + ' ' + model.get('make') + ' ' + model.get('model');
				}
			}
		},
		connector: 'appc.arrowdb'
	});
};