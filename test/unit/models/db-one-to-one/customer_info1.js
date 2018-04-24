module.exports = function (Arrow) {
	return Arrow.Model.extend('CustomerInfo1', {
		fields: {
			customer:  { type: Object, model: 'Customer' },
			address: { type: Object, model: 'Address' }
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

