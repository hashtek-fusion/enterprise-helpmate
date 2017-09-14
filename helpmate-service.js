/**
 * Created by Rajesh on 9/14/2017.
 */
'use strict';

var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
    name:'Enterprise Helpmate',
    description: 'This application manages the Enterprise level project and track status',
    script: require('path').join(__dirname,'server.js'),
    wait: 2,
    grow: .5
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
    svc.start();
    console.log('Enterprise Helpmate Service Created and started successfully...');
});

// Listen for the "uninstall" event so we know when it's done.
svc.on('uninstall',function(){
    console.log('Enterprise Helpmate Uninstall completed...');
    console.log('The service exists: ',svc.exists);
});

svc.on('stop',function(){
    console.log('Enterprise Helpmate service stopped...');
});

svc.on('start',function(){
    console.log('Enterprise Helpmate service started successfully...');
});

svc.on('error',function(){
    console.log('Unexpected error occured...');
});

if (process.argv[2] == "--add") {
    svc.install();
} else if (process.argv[2] == "--remove") {
    svc.uninstall();
}else if (process.argv[2] == "--stop") {
    svc.stop();
}else if (process.argv[2] == "--start") {
    svc.start();
}


