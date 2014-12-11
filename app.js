var APIBuilder = require('appcelerator').apibuilder,
	server = new APIBuilder();

/*
 Add two traditional models from two different connectors.
 */
server.addModel(require('./test/models/user')(APIBuilder));
server.addModel(require('./test/models/post')(APIBuilder));

/*
 Now create composite models that use both of them.
 */
server.addModel(require('./test/models/article')(APIBuilder, 'appc.composite'));
server.addModel(require('./test/models/user_post')(APIBuilder, 'appc.composite'));

server.start(function() {
	server.logger.info('server started on port', server.port);
});
