module.exports = function (Arrow) {
	return Arrow.createModel('city', {
		fields: {
			name: { type: String, description: 'city name ' },
			state: { type: String, description: 'state name', required: true }
		},
		connector: 'appc.mongo'
	});
};