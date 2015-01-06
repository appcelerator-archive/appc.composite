module.exports = function(APIBuilder) {
	return APIBuilder.Model.extend('article', {
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
						readonly: true,
						join_properties: {
							'id': 'author_id'
						}
					},
					{
						model: 'attachment',
						readonly: true,
						join_properties: {
							'id': 'attachment_id'
						}
					}
				]
			}
		}
	});
};