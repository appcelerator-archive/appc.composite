module.exports = {
	logs: './logs',
	quiet: false,
	logLevel: 'debug',
	apikey: 'bYVrelF3EQ8qGaJj/SoSlTyP6IhtA+1Y',
	admin: {
		enabled: true,
		prefix: '/mobware'
	},

	// MySQL
	host: 'localhost',
	database: 'connector',
	user: 'root',
	password: 'root',

	// Mongo
	url: 'mongodb://localhost/mobware',

	connectors: {}
};
