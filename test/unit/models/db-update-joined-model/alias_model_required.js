module.exports = function (Arrow) {
	return Arrow.Model.extend('AliasModelRequired', {
		fields: {
			rid: { type: Number, required: true, model: 'MasterModelRequired' },
			alias: { type: String, name: 'name', model: 'MasterModelRequired' }
		},
		connector: 'composite'
	});
};
