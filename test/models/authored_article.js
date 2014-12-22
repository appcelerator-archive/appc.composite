module.exports = function(APIBuilder) {
	return APIBuilder.Model.extend('authored_article', {
		fields: {
			title: { type: String, cmodel: 'post' },
			content: { type: String, cmodel: 'post' },
			author_id: { type: Number, cmodel: 'post' },
			author_first_name: { type: String, name: 'first_name', required: false, cmodel: 'user' },
			author_last_name: { type: String, name: 'last_name', required: false, cmodel: 'user' }
		},
		connector: 'appc.composite',

		metadata: {
			'appc.composite': {
				inner_join: {
					model: 'user',
					readonly: true,
					join_properties: {
						'id': 'author_id'
					}
				}
			}
		}
	});
};