var APIBuilder = require('apibuilder'),
	server = new APIBuilder(),
	ConnectorFactory = require('./lib'),
	Connector = ConnectorFactory.create(APIBuilder, server),
	connector = new Connector({
		sourceConnectors: [
			{
				connector: 'appc.mongo',
				// optionally:
				config: {}
			},
			{
				connector: 'appc.mysql'
			}
		]
	});

server.addModel(APIBuilder.createModel('article', {
	fields: {
		title: { type: String, source: 'mongo' },
		content: { type: String, source: 'mongo' },
		author_id: { type: Number, source: 'mongo' },
		author_first_name: { type: String, source: 'mysql', name: 'first_name', required: false },
		author_last_name: { type: String, source: 'mysql', name: 'last_name', required: false }
	},
	connector: connector, // aka 'appc.composite'

	metadata: {
		composite: {
			sources: [
				{
					id: 'mongo',
					connector: 'appc.mongo',
					metadata: {
						'appc.mongo': {
							table: 'post'
						}
					}
				},
				{
					id: 'mysql',
					connector: 'appc.mysql',
					metadata: {
						'appc.mysql': {
							table: 'user'
						}
					},
					left_join: {
						'id': 'author_id'
					}
				}
			]
		}
	}

	/*
	 This connector handles CRUD in this way:

	 - findAll:
	 - - with the first source, we do a findAll
	 - - for subsequent sources, we do a query, utilizing the join, and mixing in the results

	 - findOne:
	 - - with the first source, we do a findOne
	 - - for subsequent sources, we do a query, utilizing the join, and mixing in the results

	 - create / save:
	 - - none of the joined fields are required?

	 - delete:
	 - - we don't cascade 

	 */

}));

server.start(function() {
	server.logger.info('server started on port', server.port);
});
