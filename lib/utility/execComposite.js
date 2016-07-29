var _ = require('lodash'),
	async = require('async'),
	Arrow = require('arrow');

/**
 * Runs a composite method based on the provided parameters.
 * @param params
 */
exports.execComposite = function execComposite(params) {
	var self = this,
		arg = params.arg,
		next = params.next;

	if (_.isFunction(arg)) {
		next = arg;
		arg = undefined;
	}

	var joinMeta = params.Model.getMeta('left_join') || params.Model.getMeta('inner_join'),
		modelMetas = {},
		isInnerJoin = !params.Model.getMeta('left_join'),
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

	for (var fieldName in params.Model.fields) {
		/* istanbul ignore else */
		if (params.Model.fields.hasOwnProperty(fieldName)) {
			var field = params.Model.fields[fieldName],
				modelName = field.model,
				modelMeta = modelMetas[modelName];

			// Check the model.
			if (!modelName) {
				continue;
			}

			var GrabbedModel = Arrow.getModel(modelName);
			if (!GrabbedModel) {
				return next(new Error('Unable to find model ' + modelName + '.'));
			}

			// Check the field.
			if (modelMeta) {
				if (params.isWrite && (arg.getChangedFields ? arg.getChangedFields() : arg)[fieldName]) {
					return next(new Error('API-354: Joined fields cannot be written to yet.'));
				}
				if (params.method === 'query' && self.containsKey(arg, fieldName, ['sel', 'unsel'])) {
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
					multiple: field.type === 'array' || field.type === Array,
					fieldName: fieldName,
					limit: field.limit
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
		if (params.isWrite && model.readonly) {
			return cb();
		}
		if (model.left_join || !model.name) {
			return cb();
		}
		var fieldKey = self.fetchModelObjectFieldKey(params.Model, model),
			localArg = arg;
		if (localArg && fieldKey) {
			localArg = localArg[fieldKey] || (localArg.where && localArg.where[fieldKey]) || localArg;
			localArg = self.checkParse(localArg, false);
		}
		if (params.isWrite && !localArg.getPrimaryKey) {
			localArg = _.pick(localArg, _.keys(Arrow.getModel(model.name).fields));
		}
		self.execModelMethod(params.Model, model, params.method, localArg, function methodCallback(err, instance) {
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
			self.runJoin(params.Model, params.isCollection, instances, joinedModels, isInnerJoin, next);
		}
	});

};
