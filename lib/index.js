var _ = require('lodash'),
	async = require('async'),
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
		 CRUD.
		 */
		create: function create(Model, values, next) {
			var models = Model.getMeta('models'),
				model0 = models[0],
				SourceModel = server.getModel(model0.name);
			
			SourceModel.create(values, function createCallback(err, instance) {
				if (err) { next(err); }
				else {
					runJoin(Model, instance, models, next);
				}
			});
		},
		findOne: function findOne(Model, value, next) {
			var models = Model.getMeta('models');

			execModelMethod(models[0], 'findOne', value, function findOneCallback(err, instance) {
				if (err) { next(err); }
				else {
					runJoin(Model, instance, models, next);
				}
			});
		},
		findAll: function findAll(Model, next) {
			var models = Model.getMeta('models');
			execModelMethod(models[0], 'findAll', function findAllCallback(err, collection) {
				if (err) { next(err); }
				else {
					async.map(collection,
						function mapItems(instance, next) {
							runJoin(Model, instance, models, next);
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
			var models = Model.getMeta('models');
			execModelMethod(models[0], 'query', options, function queryCallback(err, collection) {
				if (err) { next(err); }
				else {
					async.map(collection,
						function mapItems(instance, next) {
							runJoin(Model, instance, models, next);
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
			var models = Model.getMeta('models'),
				model0 = models[0],
				SourceModel = server.getModel(model0.name);
			SourceModel.save(instance, function deleteCallback(err) {
				if (err) { next(err); }
				else {
					// TODO: We could handle saving other model's fields, too, probably.
					next(null, instance);
				}
			});
		},
		'delete': function(Model, instance, next) {
			var models = Model.getMeta('models'),
				model0 = models[0],
				SourceModel = server.getModel(model0.name);

			SourceModel.delete(instance, function deleteCallback(err) {
				if (err) { next(err); }
				else {
					next(null, instance);
				}
			});
		}
	});

	function runJoin(Model, instance, models, next) {
		var instance0 = instance;
		var values = instance.toJSON();
		async.each(models.slice(1), queryModel, returnInstance);

		function queryModel(model, next) {
			var query = {},
				joinBy = model.left_join;
			for (var key in joinBy) {
				if (joinBy.hasOwnProperty(key)) {
					query[key] = instance0[joinBy[key]];
				}
			}

			execModelMethod(model, 'query', {
				where: query,
				limit: 1
			}, function queryCallback(err, collection) {
				if (err) { next(err); }
				else {
					if (collection[0]) {
						// TODO: If we have collision, check fields to see which should win.
						_.defaults(values, collection[0].toJSON());
					}
					next();
				}
			});
		}

		function returnInstance() {
			for (var key in Model.fields) {
				if (Model.fields.hasOwnProperty(key)) {
					var field = Model.fields[key];
					if (field.name && field.name !== key && values[field.name] !== undefined) {
						values[key] = values[field.name];
						delete values[field.name];
					}
				}
			} 
			var instance = Model.instance(values, true);
			instance.setPrimaryKey(values.id);
			next(null, instance);
		}
	}

	function execModelMethod(model, method, arg, next) {
		if (_.isFunction(arg)) {
			next = arg;
			arg = undefined;
		}
		var SourceModel = server.getModel(model.name);
		if (arg) {
			SourceModel[method](arg, next);
		}
		else {
			SourceModel[method](next);
		}
	}

};