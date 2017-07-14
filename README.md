## Enterprise-Helpmate
This application helps to manage the projects across the Enterprise and produce the reports by analyzing the project data.

## Prerequisites
Make sure you have installed all of the following prerequisites on your development machine:
* Node.js - [Download & Install Node.js](http://www.nodejs.org/download/) and the npm package manager.
* MongoDB - [Download & Install MongoDB](http://www.mongodb.org/downloads), and make sure it's running on the default port (27017).
* Git
* Bower - You're going to use the [Bower Package Manager](http://bower.io/) to manage your front-end packages. Make sure you've installed Node.js and npm first, then install bower globally using npm:

```bash
$ npm install -g bower
```

* Grunt - You're going to use the [Grunt Task Runner](http://gruntjs.com/) to automate your development process. Make sure you've installed Node.js and npm first, then install grunt globally using npm:

```bash
$ npm install -g grunt
```
```bash
$ npm install -g grunt-cli
```

The first thing you should do is install the Node.js dependencies. The application comes pre-bundled with a package.json file that contains the list of modules you need to start your application.

To install Node.js dependencies you're going to use npm again. In the application folder run this in the command-line:

Checkout the code from GIT repository and save the code into specific directory in your local machine. Go to the folder where the files checked out into command prompt and run the following

```bash
$ npm install
```

```bash
$ bower install
```

This command does a few things:
* First it will install the dependencies needed for the application to run.
* If you're running in a development environment, it will then also install development dependencies needed for testing and running your application.
* Finally, when the install process is over, npm will initiate a bower install command to install all the front-end modules needed for the application

##Setting up MongoDB database
* Refer the configuration file under /config/env/mongoconfig.yaml to start Mongo DB with authentication
* Configure the MongoDB connection settings into respective environment config file /config/env/development
* Run the MongoDB script under the path /scripts/MongoScript.txt to set initial configuration and users. Goto Mongo shell and execute the script statements

## Running Your Application
After the install process is over, you'll be able to run your application using Grunt, just run grunt default task:

```
$ grunt
```

Open the browser and hit http://localhost:3000 to view the application. Use the default login credentials (Username: admin, Password: password) to login to application
