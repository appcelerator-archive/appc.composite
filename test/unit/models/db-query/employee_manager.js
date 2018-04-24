module.exports = function (Arrow) {
	return Arrow.Model.extend('EmployeeManager', {
		fields: {
			employee_id: { type: Number, required: true },
			manager_name: { type: String, required: true }
		},
		connector: 'memory'
	});
};
