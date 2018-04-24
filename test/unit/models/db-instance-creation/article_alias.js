module.exports = function (Arrow) {
	return Arrow.Model.extend('ArticleAliased', {
		fields: {
			title: { type: String, model: 'Post' },
			content: { type: String, model: 'Post' },
			author_id: { type: Number, model: 'Post' },
			author_first_name: { type: String, name: 'first_name', required: false, model: 'Superuser' },
			author_last_name: { type: String, name: 'last_name', required: false, model: 'Superuser' }
		},
		connector: 'composite',
		metadata: {
			composite: {
				left_join: [
					{
						model: 'Superuser',
						join_properties: {
							id: 'author_id'
						}
					}
				]
			}
		}
	});
};
