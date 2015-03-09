module.exports = function (Arrow) {
	return Arrow.Model.extend('user_post', {
		fields: {
			users: { type: Array, model: 'user' },
			posts: { type: Array, model: 'post' }
		},
		connector: 'appc.composite'
	});
};