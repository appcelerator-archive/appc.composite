module.exports = function(APIBuilder) {
	return APIBuilder.createModel('uc_9a', {
		fields: {
			users: { type: Array, model: 'appc.mysql/Composite_UserTable' },
			mssql_posts: { type: Array, model: 'appc.mssql/TEST_Post' },
			mongo_posts: { type: Array, model: 'appc.mongo/post' },
			accounts: { type: Array, model: 'appc.salesforce/Account' }
		},
		connector: 'appc.composite'
	});
};
