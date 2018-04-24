module.exports = function (Arrow) {
	return Arrow.Model.extend('CustomerInfo6', {
		fields: {
			customer:  { type: Object, model: 'Customer' },
			street: { type: String, model: 'Address' }
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

