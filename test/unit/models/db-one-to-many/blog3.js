module.exports = function (Arrow) {
	return Arrow.Model.extend('Blog3', {
		fields: {
			first_name: { type: String, name: 'first_name', model: 'Author' },
			last_name: { type: String, name: 'last_name', model: 'Author' },
			posts: { type: Array, name: 'title', model: 'Post' }
		},
		connector: 'composite',

		metadata: {
			left_join: {
				model: 'Post',
				join_properties: {
					author_id: 'id'
				}
			}
		}
	});
};
