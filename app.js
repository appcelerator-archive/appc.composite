/**
 * NOTE: This file is simply for testing this connector and will not
 * be used or packaged with the actual connector when published.
 */
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
server.addModel(require('./test/models/article')(APIBuilder));
server.addModel(require('./test/models/authoredArticle')(APIBuilder));
server.addModel(require('./test/models/userPost')(APIBuilder));
server.addModel(require('./test/models/employeeHabit')(APIBuilder));

server.start();
