module.exports = function (Arrow) {
	return Arrow.Model.extend('Post', {
		fields: {
			title: { type: String },
			content: { type: String }
		},
		connector: 'memory'
	});
};
