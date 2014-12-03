var should = require('should'),
	async = require('async'),
	url = require('url'),
	APIBuilder = require('apibuilder'),
	Connector = require('../').create(APIBuilder),
	log = APIBuilder.createLogger({}, { name: 'api-connector-composite TEST', useConsole: true, level: 'info' }),
	connector = new Connector(),
	Model;

describe("Connector", function() {

	before(function(next) {
		connector.connect(next);
	});

	it('should have tests', function(next) {
		should(false).be.true;
	});

	after(function(next) {
		connector.disconnect(next);
	});

});