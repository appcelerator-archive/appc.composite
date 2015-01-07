module.exports = function(APIBuilder) {
	return APIBuilder.Model.reduce('appc.salesforce/Contract', 'contract', {
		fields: {
			AccountId: { type: String },
			ContractNumber: { type: String }
		}
	});
};