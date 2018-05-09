'use strict';

/**
 * Module dependencies.
 */
var config = require('../config'),
	mongoose = require('./mongoose'),
	express = require('./express'),
	chalk = require('chalk'),
	cluster = require('cluster');

// Initialize Models
mongoose.loadModels();

module.exports.loadModels = function loadModels() {
	mongoose.loadModels();
};

module.exports.init = function init(callback) {

	mongoose.connect(function (db) {
		// Initialize express
		var app = express.init(db);
		if (callback) callback(app, db, config);

	});
};

module.exports.start = function start(callback) {
	var _this = this;

    if(cluster.isMaster) {
        var numWorkers = require('os').cpus().length;

        console.log('Master cluster setting up ' + numWorkers + ' workers...');

        for(var i = 0; i < numWorkers; i++) {
            cluster.fork();
        }

        cluster.on('online', function(worker) {
            console.log('Worker ' + worker.process.pid + ' is online');
        });

        cluster.on('exit', function(worker, code, signal) {
            console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
            console.log('Starting a new worker');
            cluster.fork();
        });
    }else{
        _this.init(function(app, db, config) {

            // Start the app by listening on <port>
            app.listen(config.port, function() {

                // Logging initialization
                console.log('--');
                console.log(chalk.green(config.app.title));
                console.log(chalk.green('Environment:\t\t\t' + process.env.NODE_ENV));
                console.log(chalk.green('Port:\t\t\t\t' + config.port));
                console.log(chalk.green('Database:\t\t\t\t' + config.db.uri));
                if (process.env.NODE_ENV === 'secure') {
                    console.log(chalk.green('HTTPs:\t\t\t\ton'));
                }
                console.log('--');

                if (callback) callback(app, db, config);
            });

        });
	}

};
