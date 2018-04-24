module.exports = function (Arrow) {
	return Arrow.Model.extend('ChildModel', {
		fields: { rid: { type: Number }, age: { type: String } },
		connector: 'memory'
	});
};
