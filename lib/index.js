var appc = require('appcelerator'),
	_ = appc.lodash,
	async = appc.async,
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
		constructor: function constructor() {
			var connectors = this.config.sourceConnectors;
			for (var i = 0; i < connectors.length; i++) {
				var Connector = require(connectors[i].connector).create(APIBuilder, server),
					config = connectors[i].config || {};
				connectors[i] = new Connector(config);
			}
		},
		connect: function connect(next) {
			async.each(this.config.sourceConnectors, function connectConnector(connector, cb) {
				connector.connect(cb);
			}, next);
		},
		disconnect: function disconnect(next) {
			async.each(this.config.sourceConnectors, function disconnectConnector(connector, cb) {
				connector.disconnect(cb);
			}, next);
		},

		/*
		 Introspection.
		 */
		fetchMetadata: function fetchMetadata(next) {
			next();
		},
		fetchSchema: function fetchSchema(next) {
			next();
		},

		/*
		 CRUD.
		 */
		create: function create(Model, values, next) {
			var sources = Model.getMeta('sources'),
				source0 = sources[0],
				SourceModel = APIBuilder.Model.extend('temp_' + source0.id, {
					fields: _.pick(Model.fields, function(value) {
						return value.source === source0.id;
					}),
					connector: source0.connector,
					metadata: source0.metadata
				});

			SourceModel.create(values, function createCallback(err, instance) {
				if (err) { next(err); }
				else {
					runJoin(Model, instance, sources, next);
				}
			});
		},
		findOne: function findOne(Model, value, next) {
			var sources = Model.getMeta('sources');

			execModelMethod(Model, sources[0], 'findOne', value, function findOneCallback(err, instance) {
				if (err) { next(err); }
				else {
					runJoin(Model, instance, sources, next);
				}
			});
		},
		findAll: function findAll(Model, next) {
			var sources = Model.getMeta('sources');
			execModelMethod(Model, sources[0], 'findAll', function findAllCallback(err, collection) {
				if (err) { next(err); }
				else {
					async.map(collection,
						function mapItems(instance, next) {
							runJoin(Model, instance, sources, next);
						},
						function(err, results) {
							if (err) {
								next(err);
							}
							else {
								next(null, results);
							}
						});
				}
			});
		},
		query: function query(Model, options, next) {
			var sources = Model.getMeta('sources');
			execModelMethod(Model, sources[0], 'query', options, function queryCallback(err, collection) {
				if (err) { next(err); }
				else {
					async.map(collection,
						function mapItems(instance, next) {
							runJoin(Model, instance, sources, next);
						},
						function(err, results) {
							if (err) {
								next(err);
							}
							else {
								next(null, results);
							}
						});
				}
			});
		},
		save: function(Model, instance, next) {
			var sources = Model.getMeta('sources'),
				source0 = sources[0],
				SourceModel = APIBuilder.Model.extend('temp_' + source0.id, {
					fields: _.pick(Model.fields, function(value) {
						return value.source === source0.id;
					}),
					connector: source0.connector,
					metadata: source0.metadata
				});
			SourceModel.save(instance, function deleteCallback(err) {
				if (err) { next(err); }
				else {
					// TODO: We could handle saving other source's fields, too, probably.
					next(null, instance);
				}
			});
		},
		'delete': function(Model, instance, next) {
			var sources = Model.getMeta('sources'),
				source0 = sources[0],
				SourceModel = APIBuilder.Model.extend('temp_' + source0.id, {
					fields: _.pick(Model.fields, function(value) {
						return value.source === source0.id;
					}),
					connector: source0.connector,
					metadata: source0.metadata
				});

			SourceModel.delete(instance, function deleteCallback(err) {
				if (err) { next(err); }
				else {
					next(null, instance);
				}
			});
		}
	});

	function runJoin(Model, instance, sources, next) {
		var instance0 = instance;
		var values = instance.toJSON();
		async.each(sources.slice(1), querySource, returnInstance);

		function querySource(source, next) {
			var query = {},
				joinBy = source.left_join;
			for (var key in joinBy) {
				if (joinBy.hasOwnProperty(key)) {
					query[key] = instance0[joinBy[key]];
				}
			}

			execModelMethod(Model, source, 'query', {
				where: query,
				limit: 1
			}, function queryCallback(err, collection) {
				if (err) { next(err); }
				else {
					if (collection[0]) {
						_.defaults(values, collection[0].toJSON());
					}
					next();
				}
			});
		}

		function returnInstance() {
			var instance = Model.instance(values, true);
			instance.setPrimaryKey(values.id);
			next(null, instance);
		}
	}

	function execModelMethod(Model, source, method, arg, next) {
		if (_.isFunction(arg)) {
			next = arg;
			arg = undefined;
		}
		var SourceModel = APIBuilder.Model.extend('temp_' + source.id, {
			fields: _.pick(Model.fields, function(value) {
				return value.source === source.id;
			}),
			connector: source.connector,
			metadata: source.metadata
		});
		if (arg) {
			SourceModel[method](arg, next);
		}
		else {
			SourceModel[method](next);
		}
	}

};