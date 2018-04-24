module.exports = function (Arrow) {
	return Arrow.Model.extend('EmployeeHabit', {
		fields: {
			employee_id: { type: Number, required: true },
			habit: { type: String, required: true }
		},
		connector: 'memory'
	});
};
