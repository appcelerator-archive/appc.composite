module.exports = function(APIBuilder) {
	return APIBuilder.Model.extend('accountContract', {
		fields: {
			account: { type: Object, model: 'account' },
			contract: { type: Object, model: 'contract' }
		},
		connector: 'appc.composite',
		metadata: {
			'appc.composite': {
				left_join: {
					model: 'contract',
					join_properties: {
						'AccountId': 'id'
					}
				}
			}
		}
	});
};