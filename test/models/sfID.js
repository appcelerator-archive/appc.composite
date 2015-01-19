module.exports = function(APIBuilder) {
return APIBuilder.Model.extend('sf_id', {
	fields: {
		account: { type: Object, model: 'appc.salesforce/Account' },
		contract: { type: Object, model: 'appc.salesforce/Contract' }
	},
	connector: 'appc.composite',
	metadata: {
		'appc.composite': {
			left_join: {
				model: 'appc.salesforce/Contract',
				join_properties: {
					AccountId: 'id'
				}
			}
		}
	}
});
};