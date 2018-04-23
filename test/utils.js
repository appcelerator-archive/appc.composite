var Arrow = require('arrow');
var fs = require('fs');
var path = require('path');

module.exports = function () {
	var server;
	return {
    addInstance: function (modelType, instance) {
			if (server.instances[modelType]) {
				server.instances[modelType].push(instance);
			} else {
				server.instances[modelType] = [];
				server.instances[modelType].push(instance);
			}
		},
		server: function () {
			return server;
		},
		/**
		* This method loads our memory and composite structures
		*/
		loadModelsToServer: function (database) {
			// Let's reset all previous Arrow instantiations just in case we run this test suite standalone
			Arrow.resetGlobal();
			// Note that we do not start the http server for faster execution
			var loadOnly = true;
			server = new Arrow({
				ignoreDuplicateModels: true
			}, loadOnly);
			// Store here the instances created for each model for convenience
			server.instances = {};
			var modelDir = path.join(__dirname, 'models', database);
			fs.readdirSync(modelDir).forEach(function (file) {
				if (file.indexOf('.js') > 0) {
					var model = require(path.join(modelDir, file))(Arrow);
					// Not loading the whole http server so load the connector instance out of the string name
					// But do this only once because require is overridden in Arrow so the second time we do this
					// it will automatically attach the connector instance to the model
					if (typeof model.connector === 'string') {
						model.connector = Arrow.getConnector(model.connector);
					}
					server.addModel(model);
				}
			});
			return server;
		}
	};
};
