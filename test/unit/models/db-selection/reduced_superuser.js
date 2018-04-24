module.exports = function (Arrow) {
	return Arrow.Model.extend('ReducedSuperuser', {
		fields: {
			first_name: { type: String, required: true, model: 'Superuser' },
			lname: { type: String, name: 'last_name', required: true, model: 'Superuser' },
			email: { type: String, required: true, model: 'Superuser' }
		},
		connector: 'composite'
	});
};
