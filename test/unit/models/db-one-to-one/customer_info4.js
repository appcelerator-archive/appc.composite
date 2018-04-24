module.exports = function (Arrow) {
	return Arrow.Model.extend('CustomerInfo4', {
		fields: {
			customer:  { type: Object, model: 'Customer' },
			address: { type: Object, model: 'Address' }
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

