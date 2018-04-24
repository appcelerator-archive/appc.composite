module.exports = function (Arrow) {
	return Arrow.Model.extend('MasterModel', {
		fields: { rid: { type: Number }, name: { type: String } },
		connector: 'memory'
	});
};
