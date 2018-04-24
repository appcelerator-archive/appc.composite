module.exports = function (Arrow) {
	return Arrow.Model.extend('account_contract', {
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
						AccountId: 'id'
					}
				}
			}
		}
	});
};