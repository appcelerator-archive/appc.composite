module.exports = {
	logs: './logs',
	quiet: false,
	logLevel: 'debug',
	apikey: 'bYVrelF3EQ8qGaJj/SoSlTyP6IhtA+1Y',
	admin: {
		enabled: true,
		prefix: '/apibuilder'
	},

	connectors: {
		'appc.mysql': {
			host: 'localhost',
			database: 'connector',
			user: 'root',
			password: 'root',
			port: 3306
		},
		'appc.mongo': {
			url: 'mongodb://localhost/mobware'
		},
		'appc.salesforce': {
			url: '',
			username: '',
			password: '',
			token: ''
		}
	}
};
