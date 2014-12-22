module.exports = function(APIBuilder) {
	return APIBuilder.Model.extend('user_post', {
		fields: {
			test: { type: String },
			users: { type: Array, ccollection: 'user' },
			posts: { type: Array, ccollection: 'post' }
		},
		connector: 'appc.composite'
	});
};