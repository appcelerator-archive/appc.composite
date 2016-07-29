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
		retVal = {};

	if (1 === Object.keys(instances).length) {
		var key0 = Object.keys(instances)[0],
			instance0 = instances[key0];
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
			if (!instance0) {
				retVal = false;
			}
			else {
				retVal = {
					id: instance0.getPrimaryKey ? instance0.getPrimaryKey() : instance0.id
				};
				self.populateValuesFromResult(Model, models[0], retVal, instance0.toJSON());
			}
			async.each(models.slice(1), queryModel, returnInstance);
		}
	}
	else {
		_.forIn(Model.fields, function (field, key) {
			var collectionName = field.model;
			if (instances[collectionName]) {
				retVal[key] = instances[collectionName];
			}
		});
		next(null, retVal);
	}

	/**
	 * Queries one particular model for the data needed for the join.
	 * @param model
	 * @param next
	 */
	function queryModel(model, next) {
		if (!retVal) { return next(); }

		var SourceModel = Arrow.getModel(model.name),
			query = {},
			joinBy = model.left_join,
			hasJoin = false;
		_.forIn(joinBy, function (value, key) {
			query[key] = value === 'id' && instance0.getPrimaryKey ? instance0.getPrimaryKey() : instance0[value];
			var hasField = (key === 'id' || SourceModel.fields[key]);
			if (!hasField) {
				self.logger.warn('Skipping join on "' + key + '" because the model "' + model.name + '" has no matching field.');
			}
			else if (query[key] !== undefined) {
				hasJoin = true;
			}
		});
		if (!hasJoin) {
			if (isInnerJoin) {
				retVal = null;
			}
			return next();
		}
		self.execModelMethod(Model, model, 'query', {
			where: query,
			limit: calculateLimit(model)
		}, function queryCallback(err, result) {
			if (!retVal) { return next(); }
			if (err) { return next(err); }
			if (model.multiple) {
				if (result.length) {
					for (var i = 0; i < result.length; i++) {
						var item = result[i].toJSON();
						if (!retVal[model.fieldName]) {
							retVal[model.fieldName] = [item];
						}
						else {
							retVal[model.fieldName].push(item);
						}
					}
				}
				else if (isInnerJoin) {
					retVal = null;
				}
			}
			else {
				if (result) {
					self.populateValuesFromResult(Model, model, retVal, result);
				}
				else if (isInnerJoin) {
					retVal = null;
				}
			}
			next();
		});
	}

	/**
	 * Returns the limit calculated based on particular rules.
	 * @param model contains information for limit calculation
	 * @return limit the number of items in the query result
	 */
	function calculateLimit(model) {
		if (model.multiple) {
			//Limit rule for joining with Multiple Children
			return (model.limit && (0 < model.limit && model.limit < 1001)) ? model.limit : 10;
		} else {
			return 1;
		}
	}

	/**
	 * Returns a composite instance based on the resultant queries.
	 */
	function returnInstance(err) {
		if (err) {
			return next(err);
		}
		if (!retVal) {
			return next(null, null);
		}
		var instance = Model.instance(retVal, true);
		instance.setPrimaryKey(retVal.id);
		next(null, instance);
	}
};