module.exports = function (Arrow) {
	return Arrow.Model.extend('CustomerInfo5', {
		fields: {
			customer:  { type: Object, model: 'Customer' },
			address: { type: String, name: 'street', model: 'Address' }
		},
		connector: 'composite',
		metadata: {
			inner_join: [
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

