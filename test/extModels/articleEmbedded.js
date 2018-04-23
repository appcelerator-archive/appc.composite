module.exports = function (Arrow) {
	return Arrow.Model.extend('articleEmbedded', {
		fields: {
			title: {type: String, model: 'post'},
			content: {type: String, model: 'post'},
			author_id: {type: Number, model: 'post'},
			author_first_name: {type: String, name: 'first_name', required: false, model: 'user'},
			author: {type: Object, required: false, model: 'user'}
		},
		connector: 'appc.composite',

		metadata: {
			'appc.composite': {
				left_join: [
					{
						model: 'user',
						join_properties: {
							id: 'author_id'
						}
					}
				]
			}
		}
	});
};