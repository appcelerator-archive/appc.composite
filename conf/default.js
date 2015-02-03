module.exports = {
	logs: './logs',
	quiet: false,
	logLevel: 'info',
	apikey: 'bYVrelF3EQ8qGaJj/SoSlTyP6IhtA+1Y',
	admin: {
		enabled: true,
		prefix: '/arrow'
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
			url: 'mongodb://localhost/apibuilder'
		},
		'appc.salesforce': {
			url: '',
			username: '',
			password: '',
			token: '',
			modelAutogen: false
		},
		'appc.mssql': {
			user: '',
			password: '',
			server: '',
			port: 1433,
			database: '',

			options: {
				encrypt: true
			}
		}
	}
};
