let auth = require('./auth.json');

module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-screeps');

	grunt.initConfig({
		screeps: {
			options: {
				email: auth.username,
				password: auth.password,
				branch: 'default',
				ptr: false
			},
			dist: {
				src: ['dist/*.js*']
			}
		}
	});
}