module.exports = function (Arrow) {
	return Arrow.Model.extend('SuperusersPosts', {
		fields: {
			users: { type: Array, model: 'Superuser' },
			posts: { type: Array, model: 'Post' }
		},
		connector: 'composite'
	});
};
