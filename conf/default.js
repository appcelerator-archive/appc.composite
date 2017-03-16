module.exports = {
    connectors: {
        'appc.salesforce': {
            url: 'https://test.salesforce.com/',
            username: 'dtoth@appcelerator.com.appcdev',
            password: 'mmpResearch4',
            token: '4qEFyGMb5r0VYZPZBj99Rjukv',
            modelAutogen: false,
            schemaRefresh: 3.6e+6 * 24,
            generateModels: ['Account', 'Contract']
        },
        'appc.mssql': {
            user: 'sa',
            password: 'Axway123!',
            server: 'localhost',
            port: 1433,
            database: 'master',
            options: {
                encrypt: true
            }
        },
        'appc.mysql': {
            host: '127.0.0.1',
            database: 'people',
            user: 'root',
            password: 'test',
            port: 3306,
            generateModelsFromSchema: true,
            modelAutogen: true
        },
        'appc.arrowdb': {
            requireSessionLogin: false,
            key: 'eTqafmrgKhhSjreTezjTr00nggsHeDwr',
            username: 'pagoyal@axway.com',
            password: '1234567890',
            generateModelsFromSchema: true,
            modelAutogen: true
        },
        'appc.mongo': {
            url: 'mongodb://appcconn:Connectors2016@ds035856.mlab.com:35856/appcconn',
            generateModelsFromSchema: true,
            modelAutogen: false
        }
    }
};
