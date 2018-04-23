module.exports = function (Arrow) {
	return Arrow.Model.extend('article_objects', {
		fields: {
			post: { type: Object, model: 'post' },
			author: { type: Object, model: 'user' },
			attachment: { type: Object, model: 'attachment' }
		},
		connector: 'appc.composite',

		metadata: {
			'appc.composite': {
				left_join: [
					{
						model: 'user',
						join_properties: {
							id: 'author_id'
						}
					},
					{
						model: 'attachment',
						join_properties: {
							id: 'attachment_id'
						}
					}
				]
			}
		}
	});
};