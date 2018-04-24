module.exports = function (Arrow) {
	return Arrow.Model.extend('Attachment', {
		fields: {
			attachment_content: { name: 'content', type: String }
		},
		connector: 'memory'
	});
};
