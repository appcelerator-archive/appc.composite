module.exports = function(Arrow) {
	return Arrow.Model.reduce('appc.salesforce/Account', 'account', {
		fields: {
			Name: { type: String },
			Type: { type: String },
			recordId: { type: String, name: "RecordTypeId" },
			BillingStreet: { type: String }
		}
	});
};