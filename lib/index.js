/*
 Welcome to the Composite connector!
 */
var _ = require('lodash');

/**
 * Creates the Composite connector for Arrow.
 */
exports.create = function (Arrow) {
	var Connector = Arrow.Connector,
		Capabilities = Connector.Capabilities;

	return Connector.extend({
		filename: module.filename,
		capabilities: [
			Capabilities.CanCreate,
			Capabilities.CanRetrieve,
			Capabilities.CanUpdate,
			Capabilities.CanDelete
		]
	});
};
