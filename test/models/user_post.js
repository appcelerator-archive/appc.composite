module.exports = function(APIBuilder, connector) {
	return APIBuilder.Model.extend('user_post', {
		fields: {
			test: { type: String },
			users: { type: Object, collection: 'user' },
			posts: { type: Object, collection: 'post' }
		},
		connector: connector,

		metadata: {
			composite: {
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