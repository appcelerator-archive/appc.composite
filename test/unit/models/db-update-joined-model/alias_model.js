module.exports = function (Arrow) {
	return Arrow.Model.extend('AliasModel', {
		fields: {
			rid: { type: Number, required: true, model: 'MasterModel' },
			alias: { type: String, name: 'name', model: 'MasterModel' }
		},
		connector: 'composite'
	});
};
