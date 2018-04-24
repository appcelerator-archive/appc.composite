module.exports = function (Arrow) {
	return Arrow.Model.extend('BadModel', {
		fields: {
			title: { type: String, model: 'i_dont_exist' },
			author_id: { type: Number, model: 'i_dont_exist' },
			first_name: { type: String, model: 'Superuser' }
		},
		connector: 'composite',

		metadata: {
			left_join: {
				model: 'i_dont_exist',
				join_properties: {
					id: 'author_id'
				}
			}
		}
	});
};
