module.exports = function(APIBuilder) {
	return APIBuilder.Model.extend('post', {
		fields: {
			title: { type: String },
			content: { type: String },
			author_id: { type: Number }
		},
		connector: 'appc.mongo',

		metadata: {
			'appc.mongo': {
				table: 'Composite_Post'
			}
		}
	});
};