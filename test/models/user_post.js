module.exports = function(APIBuilder) {
	return APIBuilder.Model.extend('user_post', {
		fields: {
			test: { type: String },
			users: { type: Object, collection: 'user' },
			posts: { type: Object, collection: 'post' }
		},
		connector: 'appc.composite',

		metadata: {
			'appc.composite': {
				models: [
					{
						name: 'post'
					},
					{
						name: 'user'
					}
				]
			}
		}
	});
};