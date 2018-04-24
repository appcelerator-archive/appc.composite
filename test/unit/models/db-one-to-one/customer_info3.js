module.exports = function (Arrow) {
	return Arrow.Model.extend('CustomerInfo3', {
		fields: {
			customer:  { type: Object, model: 'Customer' },
			street: { type: String, model: 'Address' }
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

