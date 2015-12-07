exports.populateValuesFromResult = function populateValuesFromResult(Model, model, retVal, result) {
	for (var key in Model.fields) {
		/* istanbul ignore else */
		if (Model.fields.hasOwnProperty(key)) {
			var field = Model.fields[key],
				isObject = field.type === Object || field.type === 'object',
				isArray = field.type === Array || field.type === 'array';
			if (field.model === model.name) {
				retVal[key] = isObject || isArray ? result : result[field.name || key];
			}
		}
	}
};
