var _ = require('lodash'),
	async = require('async'),
	pkginfo = require('pkginfo')(module) && module.exports;

// --------- Composite Connector -------

exports.create = function(APIBuilder, server) {

	var Connector = APIBuilder.Connector;
	return Connector.extend({
		config: APIBuilder.Loader(),
		name: 'composite',
		pkginfo: _.pick(pkginfo, 'name', 'version', 'description', 'author', 'license', 'keywords', 'repository'),
		logger: APIBuilder.createLogger({}, { name: 'api-connector-composite', useConsole: true, level: 'debug' }),

		/*
		 CRUD.
		 */
		create: function create(Model, values, next) {
			execComposite('create', true, false, Model, values, next);
		},
		findOne: function findOne(Model, value, next) {
			value = checkParse(value);
			execComposite('findOne', false, false, Model, value, next);
		},
		findAll: function findAll(Model, next) {
			execComposite('findAll', false, true, Model, next);
		},
		query: function query(Model, options, next) {
			execComposite('query', false, true, Model, options, next);
		},
		save: function(Model, instance, next) {
			execComposite('save', true, false, Model, instance, next);
		},
		'delete': function(Model, instance, next) {
			execComposite('delete', true, false, Model, instance, next);
		}
	});

	/**
	 * Runs a composite method based on the provided parameters.
	 * @param method
	 * @param isWrite
	 * @param isCollection
	 * @param Model
	 * @param arg
	 * @param next
	 */
	function execComposite(method, isWrite, isCollection, Model, arg, next) {
		if (_.isFunction(arg)) {
			next = arg;
			arg = undefined;
		}

		var models = Model.getMeta('models'),
			instances = {};

		async.each(models, function modelExecHandler(model, cb) {
			if (isWrite && model.readonly) {
				return cb();
			}
			if (model.left_join) {
				return cb();
			}
			execModelMethod(model, method, arg, function methodCallback(err, instance) {
				if (err) {
					cb(err);
				}
				else {
					instances[model.name] = instance;
					cb();
				}
			});
		}, function modelsDoneCallback(err) {
			if (err) {
				next(err);
			}
			else {
				runJoin(Model, isCollection, instances, models, next);
			}
		});

	}

	/**
	 * Runs a join (reading and combining fields) on the supplied data.
	 * @param Model
	 * @param isCollection
	 * @param instances
	 * @param models
	 * @param next
	 */
	function runJoin(Model, isCollection, instances, models, next) {

		// Left join mode? This isn't the best way to detect it...
		if (1 === Object.keys(instances).length) {
			var key0 = Object.keys(instances)[0];
			var instance0 = instances[key0];
			if (isCollection) {
				async.map(instance0,
					function mapItems(instance, cb) {
						runJoin(Model, false, { key0: instance }, models, cb);
					}, next);
			}
			else {
				var values = instance0.toJSON();
				async.each(models.slice(1), queryModel, returnInstance);
			}
		}
		else {
			var retVal = {};
			for (var key in Model.fields) {
				if (Model.fields.hasOwnProperty(key)) {
					var field = Model.fields[key];
					if (instances[field.collection]) {
						retVal[field.collection] = instances[field.collection];
					}
				}
			}
			next(null, retVal);
		}

		/**
		 * Queries one particular model for the data needed for the join.
		 * @param model
		 * @param next
		 */
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
						// TODO: We need to be able to specify which model a field is from.
						_.defaults(values, collection[0].toJSON());
					}
					next();
				}
			});
		}

		/**
		 * Returns a composite instance based on the resultant queries.
		 */
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

	/**
	 * Executes a model's method based on the provided args.
	 * @param model
	 * @param method
	 * @param arg
	 * @param next
	 */
	function execModelMethod(model, method, arg, next) {
		if (_.isFunction(arg)) {
			next = arg;
			arg = undefined;
		}
		var SourceModel = server.getModel(model.name);
		if (arg) {
			if (arg[model.name]) {
				arg = arg[model.name];
			}
			SourceModel[method](arg, next);
		}
		else {
			SourceModel[method](next);
		}
	}

	function checkParse(val, shouldThrowOnFail) {
		if (typeof val === 'string' && val[0] === '{') {
			try {
				return JSON.parse(val);
			}
			catch (err) {
				if (shouldThrowOnFail) {
					throw err;
				}
			}
		}
		return val;
	}

};