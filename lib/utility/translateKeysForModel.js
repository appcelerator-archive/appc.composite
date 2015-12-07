var _ = require('lodash');

exports.translateKeysForModel = function translateKeysForModel(MasterModel, SourceModel, arg) {
	if (!_.isObject(arg)) {
		return;
	}
	var mFields = MasterModel.fields,
		sFields = SourceModel.fields;
	for (var key in arg) {
		/* istanbul ignore else */
		if (arg.hasOwnProperty(key)) {
			if (_.isObject(arg[key]) && !arg[key].$like) {
				this.translateKeysForModel(MasterModel, SourceModel, arg[key]);
				continue;
			}
			if (mFields[key] && mFields[key].name && sFields[mFields[key].name]) {
				arg[mFields[key].name] = arg[key];
				delete arg[key];
			}
		}
	}
};
