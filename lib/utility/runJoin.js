var async = require('async'),
	Arrow = require('arrow'),
	_ = require('lodash');

/**
 * Runs a join (reading and combining fields) on the supplied data.
 * @param Model
 * @param isCollection
 * @param instances
 * @param models
 * @param isInnerJoin
 * @param next
 */
exports.runJoin = function runJoin(Model, isCollection, instances, models, isInnerJoin, next) {
	var self = this,
		values;

	if (1 === Object.keys(instances).length) {
		var key0 = Object.keys(instances)[0];
		var instance0 = instances[key0];
		if (isCollection) {
			async.map(instance0,
				function mapItems(instance, cb) {
					self.runJoin(Model, false, {key0: instance}, models, isInnerJoin, cb);
				}, function (err, results) {
					if (err) {
						next(err);
					}
					else {
						next(null, _.isArray(results) ? _.compact(results) : results);
					}
				});
		}
		else {
			var fieldKey = self.fetchModelObjectFieldKey(Model, models[0]);
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

		var SourceModel = Arrow.getModel(model.name),
			query = {},
			joinBy = model.left_join,
			hasJoin = false;
		for (var key in joinBy) {
			if (joinBy.hasOwnProperty(key)) {
				query[key] = joinBy[key] === 'id' ? instance0.getPrimaryKey() : instance0[joinBy[key]];
				var hasField = (key === 'id' || SourceModel.fields[key]);
				if (!hasField) {
					self.logger.warn('Skipping join on "' + key + '" because the model "' + model.name + '" has no matching field.');
				}
				else if (query[key] !== undefined) {
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
		self.execModelMethod(Model, model, 'query', {
			where: query,
			limit: model.multiple ? undefined : 1
		}, function queryCallback(err, result) {
			if (!values) { return next(); }
			if (err) { return next(err); }
			if (model.multiple) {
				if (result.length) {
					for (var i = 0; i < result.length; i++) {
						var item = result[i].toJSON();
						if (!values[model.fieldName]) {
							values[model.fieldName] = [item];
						}
						else {
							values[model.fieldName].push(item);
						}
					}
				}
				else if (isInnerJoin) {
					values = null;
				}
			}
			else {
				if (result) {
					var fieldKey = self.fetchModelObjectFieldKey(Model, model);
					if (fieldKey) {
						values[fieldKey] = result.toJSON();
					}
					else {
						_.defaults(values, result.toJSON());
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
};
