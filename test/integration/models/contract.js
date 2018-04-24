module.exports = function (Arrow) {
	return Arrow.Model.reduce('appc.salesforce/Contract', 'contract', {
		fields: {
			AccountId: { type: String },
			ContractNumber: { type: String }
		}
	});
};