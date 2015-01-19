var _ = require('lodash'),
	async = require('async'),
	pkginfo = require('pkginfo')(module) && module.exports,
	logger;

// --------- Composite Connector -------

exports.create = function(APIBuilder, server) {

	var Connector = APIBuilder.Connector;
	logger = APIBuilder.createLogger({}, { name: pkginfo.name, useConsole: true });

	return Connector.extend({

		/*
		 Configuration.
		 */
		pkginfo: _.pick(pkginfo, 'name', 'version', 'description', 'author', 'license', 'keywords', 'repository'),
		defaultConfig: '',

		/*
		 CRUD.
		 */
		create: function create(Model, values, next) {
			execComposite('create', true, false, Model, values, next);
		},
		findOne: function findOne(Model, value, next) {
			value = checkParse(value, false);
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

		var joinMeta = Model.getMeta('left_join') || Model.getMeta('inner_join'),
			modelMetas = {},
			isInnerJoin = !Model.getMeta('left_join'),
			modelMap = {},
			joinedModels = [],
			instances = {};

		if (_.isArray(joinMeta)) {
			for (var i = 0; i < joinMeta.length; i++) {
				modelMetas[joinMeta[i].model] = joinMeta[i];
			}
		}
		else if (joinMeta) {
			modelMetas[joinMeta.model] = joinMeta;
		}

		for (var fieldName in Model.fields) {
			if (Model.fields.hasOwnProperty(fieldName)) {
				var field = Model.fields[fieldName],
					modelName = field.model,
					modelMeta = modelMetas[modelName];

				// Check the model.
				var GrabbedModel = server.getModel(modelName);
				if (!GrabbedModel) {
					return next(new Error('Unable to find model ' + modelName + '.'));
				}

				// Check the field.
				if (modelMeta) {
					if (isWrite && (arg.getChangedFields ? arg.getChangedFields() : arg)[fieldName]) {
						return next(new Error('API-354: Joined fields cannot be written to yet.'));
					}
					if (method === 'query' && containsKey(arg, fieldName, ['sel', 'unsel'])) {
						return next(new Error('API-354: Joined fields cannot be queried on yet.'));
					}
				}

				// Map the model.
				if (modelMap[modelName]) {
					continue;
				}
				modelMap[modelName] = true;
				if (modelMeta) {
					joinedModels.push({
						name: modelName,
						readonly: true,
						left_join: modelMeta.join_properties,
						multiple: field.type === 'array' || field.type === Array
					});
				}
				else {
					joinedModels.unshift({
						name: modelName
					});
				}
			}
		}

		async.each(joinedModels, function modelExecHandler(model, cb) {
			if (isWrite && model.readonly) {
				return cb();
			}
			if (model.left_join) {
				return cb();
			}
			var fieldKey = fetchModelObjectFieldKey(Model, model);
			var localArg = arg;
			if (localArg && fieldKey) {
				localArg = localArg[fieldKey] || (localArg.where && localArg.where[fieldKey]) || localArg;
				localArg = checkParse(localArg, false);
			}
			execModelMethod(model, method, localArg, function methodCallback(err, instance) {
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
				runJoin(Model, isCollection, instances, joinedModels, isInnerJoin, next);
			}
		});

	}

	/**
	 * Runs a join (reading and combining fields) on the supplied data.
	 * @param Model
	 * @param isCollection
	 * @param instances
	 * @param models
	 * @param isInnerJoin
	 * @param next
	 */
	function runJoin(Model, isCollection, instances, models, isInnerJoin, next) {

		var values;

		if (1 === Object.keys(instances).length) {
			var key0 = Object.keys(instances)[0];
			var instance0 = instances[key0];
			if (isCollection) {
				async.map(instance0,
					function mapItems(instance, cb) {
						runJoin(Model, false, { key0: instance }, models, isInnerJoin, cb);
					}, function(err, results) {
						if (err) {
							next(err);
						}
						else {
							next(null, !results.filter ? results : results.filter(filterFalsy));
						}
					});
			}
			else {
				var fieldKey = fetchModelObjectFieldKey(Model, models[0]);
				if (fieldKey) {
					values = {
						id: instance0.getPrimaryKey()
					};
					values[fieldKey] = instance0.toJSON();
				}
				else {
					values = instance0 && instance0.toJSON && instance0.toJSON() || instance0;
				}
				async.each(models.slice(1), queryModel, returnInstance);
			}
		}
		else {
			var retVal = {};
			for (var key in Model.fields) {
				if (Model.fields.hasOwnProperty(key)) {
					var field = Model.fields[key],
						collectionName = field.model;
					if (instances[collectionName]) {
						retVal[key] = instances[collectionName];
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
			if (!values) { return next(); }

			var SourceModel = server.getModel(model.name),
				query = {},
				joinBy = model.left_join,
				hasJoin = false;
			for (var key in joinBy) {
				if (joinBy.hasOwnProperty(key)) {
					query[key] = joinBy[key] === 'id' ? instance0.getPrimaryKey() : instance0[joinBy[key]];
					var hasField = (key === 'id' || SourceModel.fields[key]);
					if (!hasField) {
						logger.warn('Skipping join on "' + key + '" because the model "' + model.name + '" has no matching field.');
					}
					else if (query[key]) {
						hasJoin = true;
					}
				}
			}
			if (!hasJoin) {
				if (isInnerJoin) {
					values = null;
				}
				return next();
			}
			execModelMethod(model, 'query', {
				where: query,
				limit: model.multiple ? undefined : 1
			}, function queryCallback(err, collection) {
				if (!values) { return next(); }
				if (err) { return next(err); }
				if (model.multiple) {
					if (collection.length) {
						for (var i = 0; i < collection.length; i++) {
							var item = collection[i].toJSON();
							for (var key in item) {
								if (item.hasOwnProperty(key)) {
									if (undefined === values[key]) {
										values[key] = [
											item[key]
										];
									}
									else if (_.isArray(values[key])) {
										values[key].push(item[key]);
									}
								}
							}
						}
					}
					else if (isInnerJoin) {
						values = null;
					}
				}
				else {
					if (collection[0]) {
						var fieldKey = fetchModelObjectFieldKey(Model, model);
						if (fieldKey) {
							values[fieldKey] = collection[0].toJSON();
						}
						else {
							_.defaults(values, collection[0].toJSON());
						}
					}
					else if (isInnerJoin) {
						values = null;
					}
				}
				next();
			});
		}

		/**
		 * Returns a composite instance based on the resultant queries.
		 */
		function returnInstance(err) {
			if (err) {
				return next(err);
			}
			if (!values) {
				return next(null, null);
			}
			var result = {};
			for (var key in Model.fields) {
				if (Model.fields.hasOwnProperty(key)) {
					var field = Model.fields[key];
					result[field.name || key] = values[field.name || key];
				}
			}
			var instance = Model.instance(result, true);
			instance.setPrimaryKey(values.id);
			next(null, instance);
		}
	}

	/**
	 * Looks for a field with a type of Object and a matching model name.
	 * @param Model
	 * @param model
	 * @returns {*}
	 */
	function fetchModelObjectFieldKey(Model, model) {
		for (var key in Model.fields) {
			if (Model.fields.hasOwnProperty(key)) {
				var field = Model.fields[key],
					isObject = field.type === Object || field.type === 'object',
					isArray = field.type === Array || field.type === 'array';
				if (field.model === model.name && (isObject || isArray)) {
					return key;
				}
			}
		}
		return null;
	}

	/**
	 * Executes a model's method based on the provided args.
	 * @param model
	 * @param method
	 * @param arg
	 * @param next
	 */
	function execModelMethod(model, method, arg, next) {
		var SourceModel = server.getModel(model.name);
		if (arg) {
			if (arg[model.name]) {
				arg = arg[model.name];
			}
			if (method === 'save' || method === 'findOne' || method === 'delete') {
				// Don't change anything.
			}
			else if (method !== 'query') {
				arg = _.pick(arg, Object.keys(SourceModel.fields));
			}
			else if (arg.where) {
				arg.where = _.pick(arg.where, Object.keys(SourceModel.fields));
			}
			SourceModel[method](arg, next);
		}
		else {
			SourceModel[method](next);
		}
	}

	function checkParse(val) {
		if (typeof val === 'string' && val[0] === '{') {
			try {
				return JSON.parse(val);
			}
			catch (err) {
				// Eat the parse error.
				logger.warn('Failed to parse JSON:', val, 'with error:', err, 'continuing on.');
			}
		}
		return val;
	}

	function filterFalsy(item) {
		return !!item;
	}

	function containsKey(obj, key, ignore) {
		for (var sKey in obj) {
			if (obj.hasOwnProperty(sKey)) {
				if (ignore && ignore.indexOf(sKey) >= 0) {
					continue;
				}
				if (sKey === key || (_.isObject(obj[sKey]) && containsKey(obj[sKey], key, ignore))) {
					return true;
				}
			}
		}
		return false;
	}
};