module.exports = function(APIBuilder) {
	return APIBuilder.Model.extend('user_post', {
		fields: {
			test: { type: String },
			users: { type: Array, collection: 'user' },
			posts: { type: Array, collection: 'post' }
		},
		connector: 'appc.composite'
	});
};