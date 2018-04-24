module.exports = function (Arrow) {
	return Arrow.Model.extend('CustomerInfo2', {
		fields: {
			customer:  { type: Object, model: 'Customer' },
			address: { type: String, name: 'street', model: 'Address' }
		},
		connector: 'composite',
		metadata: {
			left_join: [
				{
					model: 'Address',
					join_properties: {
						customerId: 'id'
					}
				}
			]
		}
	});
};

