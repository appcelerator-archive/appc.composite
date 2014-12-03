var appc = require('appcelerator'),
	_ = appc.lodash,
	pkginfo = require('pkginfo')(module) && module.exports;

// --------- Composite Connector -------

exports.create = function(APIBuilder, server) {

	var Connector = APIBuilder.Connector,
		Collection = APIBuilder.Collection;

	return Connector.extend({
		config: APIBuilder.Loader(),
		name: 'composite',
		pkginfo: _.pick(pkginfo, 'name', 'version', 'description', 'author', 'license', 'keywords', 'repository'),
		logger: APIBuilder.createLogger({}, { name: 'api-connector-composite', useConsole: true, level: 'debug' }),

		/*
		 Lifecycle.
		 */
		constructor: function() {},
		connect: doNext,
		disconnect: doNext,

		/*
		 Introspection.
		 */
		fetchConfig: doNext,
		fetchMetadata: doNext,
		fetchSchema: doNext,

		/*
		 CRUD.
		 */
		create: function(Model, values, next) {
			var instance = Model.instance(values, false);
			next(null, instance);
		},
		findAll: fakeFindCollection,
		findOne: fakeFindModel,
		query: fakeFindCollection,
		save: function(Model, instance, next) {
			next(null, instance);
		},
		'delete': function(Model, instance, next) {
			next(null, instance);
		}
	});

	function doNext(next) {
		next();
	}

	function fakeFindModel(Model, value, next) {
		var instance = Model.instance({
			title: 'My Title',
			content: 'My Content',
			author_id: '6e75cad0-7b24-11e4-8cce-b54dac11af63',
			author_first_name: 'Dawson',
			author_last_name: 'Toth'
		}, true);
		instance.setPrimaryKey('e7f12590-7b23-11e4-8cce-b54dac11af63');
		next(null, instance);
	}

	function fakeFindCollection(Model, next) {
		var array = [];
		for (var c = 0; c < 4; c++) {
			var instance = Model.instance({
				title: 'My Title',
				content: 'My Content',
				author_id: '6e75cad0-7b24-11e4-8cce-b54dac11af63',
				author_first_name: 'Dawson',
				author_last_name: 'Toth'
			}, true);
			instance.setPrimaryKey('e7f12590-7b23-11e4-8cce-b54dac11af63');
			array.push(instance);
		}
		next(null, new Collection(Model, array));
	}

};