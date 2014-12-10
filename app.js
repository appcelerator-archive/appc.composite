var APIBuilder = require('appcelerator').apibuilder,
	server = new APIBuilder();

/*

 Add two traditional models from two different connectors.

 */
server.addModel(APIBuilder.Model.extend('user', {
	fields: {
		first_name: { type: String },
		last_name: { type: String }
	},
	connector: 'appc.mysql'
}));
server.addModel(APIBuilder.Model.extend('post', {
	fields: {
		title: { type: String },
		content: { type: String },
		author_id: { type: Number }
	},
	connector: 'appc.mongo'
}));

/*

 Now create a composite model that uses both of them.

 */
server.addModel(APIBuilder.Model.extend('article', {
	fields: {
		title: { type: String },
		content: { type: String },
		author_id: { type: Number },
		author_first_name: { type: String, name: 'first_name', required: false },
		author_last_name: { type: String, name: 'last_name', required: false }
	},
	connector: 'appc.composite',

	metadata: {
		composite: {
			models: [
				{
					name: 'post'
				},
				{
					name: 'user',
					left_join: {
						'id': 'author_id'
					}
				}
			]
		}
	}
}));

server.start(function() {
	server.logger.info('server started on port', server.port);
});
