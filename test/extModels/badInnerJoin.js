module.exports = function (Arrow) {
	return Arrow.Model.extend('bad_inner_join', {
		fields: {
			title: { type: String, model: 'post' },
			content: { type: String, model: 'post' },
			author_id: { type: Number, model: 'post' },
			author_first_name: { type: String, name: 'first_name', required: false, model: 'user' },
			author_last_name: { type: String, name: 'last_name', required: false, model: 'user' }
		},
		connector: 'appc.composite',

		metadata: {
			'appc.composite': {
				inner_join: {
					model: 'user'
				}
			}
		}
	});
};