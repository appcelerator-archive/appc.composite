module.exports = function(APIBuilder) {
	return APIBuilder.createModel('uc_9a', {
		fields: {
			users: { type: Array, collection: 'appc.mysql/Composite_UserTable' },
			mssql_posts: { type: Array, collection: 'appc.mssql/TEST_Post' },
			mongo_posts: { type: Array, collection: 'appc.mongo/post' },
			accounts: { type: Array, collection: 'appc.salesforce/Account' }
		},
		connector: 'appc.composite'
	});
};
