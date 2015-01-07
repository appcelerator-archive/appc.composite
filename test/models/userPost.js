module.exports = function(APIBuilder) {
	return APIBuilder.Model.extend('user_post', {
		fields: {
			users: { type: Array, collection: 'user' },
			posts: { type: Array, collection: 'post' }
		},
		connector: 'appc.composite'
	});
};