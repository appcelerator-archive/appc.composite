module.exports = function (Arrow) {
	return Arrow.Model.extend('CustomerInfo7', {
		fields: {
			customer:  { type: Object, model: 'Customer' },
			address: { type: Object, name: 'street', model: 'Address' }
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

