module.exports = function (Arrow) {
	return Arrow.Model.extend('JoinedModel', {
		fields: {
			rid: { type: Number, model: 'MasterModel' },
			name: { type: String, name: 'name', model: 'MasterModel' },
			age: { type: String, name: 'age', model: 'ChildModel' },
			customField: { type: String, custom: true }
		},
		connector: 'composite',

		metadata: {
			left_join: {
				model: 'ChildModel',
				join_properties: {
					rid: 'rid'
				}
			}
		}
	});
};
