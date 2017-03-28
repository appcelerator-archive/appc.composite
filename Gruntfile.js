module.exports = function (grunt) {

	// Project configuration.
	grunt.initConfig({
		mocha_istanbul: {
			coverage: {
				src: 'test',
				options: {
					timeout: 30000,
					ignoreLeaks: false,
					check: {
						statements: 90,
						branches: 90,
						functions: 90,
						lines: 90
					}
				}
			}
		},
		jshint: {
			options: {
				reporterOutput: "",
				jshintrc: true
			},
			src: ['lib/**/*.js', 'test/**/*.js']
		},
		clean: ['tmp']
	});

	// Load grunt plugins for modules.
	grunt.loadNpmTasks('grunt-contrib-jshint');
	// TODO: Uncomment when unit-tests are working
	// grunt.loadNpmTasks('grunt-mocha-istanbul');
	grunt.loadNpmTasks('grunt-contrib-clean');

	// Register tasks.
	// TODO: Uncomment when unit-tests are working
 	// grunt.registerTask('default', ['jshint', 'mocha_istanbul:coverage', 'clean']);
	grunt.registerTask('default', ['jshint', 'clean']);
};
