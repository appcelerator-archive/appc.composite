module.exports = function (Arrow) {
	return Arrow.Model.extend('Article', {
		fields: {
			title: { type: String, model: 'Post' },
			content: { type: String, model: 'Post' },
			author_id: { type: Number, model: 'Post' },
			first_name: { type: String, required: false, model: 'Superuser' },
			last_name: { type: String, required: false, model: 'Superuser' }
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
