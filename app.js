/**
 * NOTE: This file is simply for testing this connector and will not
 * be used or packaged with the actual connector when published.
 */
var Arrow = require('appcelerator').arrow,
	server = new Arrow();

/*
 Add traditional models from different connectors.
 */
server.addModel(require('./test/models/user')(Arrow));
server.addModel(require('./test/models/post')(Arrow));

/*
 Now create composite models that use them.
 */
server.addModel(require('./test/models/article')(Arrow));
server.addModel(require('./test/models/authoredArticle')(Arrow));
server.addModel(require('./test/models/userPost')(Arrow));
server.addModel(require('./test/models/employeeHabit')(Arrow));

server.start();
