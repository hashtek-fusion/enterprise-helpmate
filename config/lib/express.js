'use strict';

/**
 * Module dependencies.
 */
var config = require('../config'),
  express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  json2xls = require('json2xls'),
  session = require('express-session'),
  MongoStore = require('connect-mongo')(session),
  multer = require('multer'),
  favicon = require('serve-favicon'),
  compress = require('compression'),
  methodOverride = require('method-override'),
  cookieParser = require('cookie-parser'),
  helmet = require('helmet'),
  flash = require('connect-flash'),
  consolidate = require('consolidate'),
  proxy = require('express-http-proxy'),
  path = require('path');

/**
 * Initialize local variables
 */
module.exports.initLocalVariables = function (app) {
  // Setting application local variables
  app.locals.title = config.app.title;
  app.locals.description = config.app.description;
  app.locals.secure = config.secure;
  app.locals.keywords = config.app.keywords;
  app.locals.googleAnalyticsTrackingID = config.app.googleAnalyticsTrackingID;
  app.locals.facebookAppId = config.facebook.clientID;
  app.locals.jsFiles = config.files.client.js;
  app.locals.cssFiles = config.files.client.css;
  app.locals.livereload = config.livereload;
  app.locals.logo = config.logo;
  app.locals.favicon = config.favicon;
  app.locals.basePath = (config.basePath && config.basePath!==''?'/'+config.basePath+'/':'/');
  // Passing the request url to environment locals
  app.use(function (req, res, next) {
    res.locals.host = req.protocol + '://' + req.hostname;
    res.locals.url = req.protocol + '://' + req.headers.host + req.originalUrl;
    res.locals.basePath = (config.basePath && config.basePath!==''?'/'+config.basePath+'/':'/');
    next();
  });
};

/**
 * Initialize application middleware
 */
module.exports.initMiddleware = function (app) {
  // Showing stack errors
  app.set('showStackError', true);

  // Enable jsonp
  app.enable('jsonp callback');

  // Should be placed before express.static
  app.use(compress({
    filter: function (req, res) {
      return (/json|text|javascript|css|font|svg/).test(res.getHeader('Content-Type'));
    },
    level: 9
  }));

  // Initialize favicon middleware
  app.use(favicon('./modules/core/client/img/brand/favicon.ico'));

 //Proxy the request based on context path set to load the .css and .js resources
  if(config.basePath && config.basePath!=='' && config.secure){
      app.use('/'+config.basePath,proxy(config.host +':'+ config.port,{
          limit: '5mb',//Proxy has to set limit and based on this only upload file size should work
          https: true,
          proxyReqOptDecorator: function(proxyReqOpts, originalReq) {
              proxyReqOpts.requestCert =true;
              proxyReqOpts.rejectUnauthorized = false;
              return proxyReqOpts;
          }
      }));
  }else if(config.basePath && config.basePath!==''){
      app.use('/'+config.basePath,proxy(config.host +':'+ config.port,{
          limit: '5mb',//Proxy has to set limit and based on this only upload file size should work
      }));
  }

  // Environment dependent middleware
  if (process.env.NODE_ENV === 'development') {
    // Enable logger (morgan)
    app.use(morgan('dev'));

    // Disable views cache
    app.set('view cache', false);
  } else if (process.env.NODE_ENV === 'production') {
    app.locals.cache = 'memory';
  }
  // Request body parsing middleware should be above methodOverride
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json());
  app.use(json2xls.middleware);
  app.use(methodOverride());

  // Add the cookie parser and flash middleware
  app.use(cookieParser());
  app.use(flash());

  // Add multipart handling middleware
  app.use(multer({
    dest: './uploads/',
    inMemory: true
  }));

  //Setting response headers not to cache API response IE Cache Fix
    app.use('/api', function(req,res,next){
      res.set('Cache-Control','no-cache');
      res.set('Pragma','no-cache');
      res.set('Expires', -1);
      next();
    });

};

/**
 * Configure view engine
 */
module.exports.initViewEngine = function (app) {
  // Set swig as the template engine
  app.engine('server.view.html', consolidate[config.templateEngine]);

  // Set views path and view engine
  app.set('view engine', 'server.view.html');
  app.set('views', './');
};

/**
 * Configure Express session
 */
module.exports.initSession = function (app, db) {
  // Express MongoDB session storage
  app.use(session({
    saveUninitialized: true,
    resave: true,
    secret: config.sessionSecret,
    store: new MongoStore({
      mongooseConnection: db.connection,
      collection: config.sessionCollection
    })
  }));
};

/**
 * Invoke modules server configuration
 */
module.exports.initModulesConfiguration = function (app, db) {
  config.files.server.configs.forEach(function (configPath) {
    require(path.resolve(configPath))(app, db);
  });
};

/**
 * Configure Helmet headers configuration
 */
module.exports.initHelmetHeaders = function (app) {
  // Use helmet to secure Express headers
  app.use(helmet.xframe());
  app.use(helmet.xssFilter());
  app.use(helmet.nosniff());
  app.use(helmet.ienoopen());
  app.disable('x-powered-by');
};

/**
 * Configure the modules static routes
 */
module.exports.initModulesClientRoutes = function (app) {
  // Setting the app router and static folder
  app.use('/', express.static(path.resolve('./public')));

  // Globbing static routing
  config.folders.client.forEach(function (staticPath) {
    app.use(staticPath.replace('/client', ''), express.static(path.resolve('./' + staticPath)));
  });
};

/**
 * Configure the modules ACL policies
 */
module.exports.initModulesServerPolicies = function (app) {
  // Globbing policy files
  config.files.server.policies.forEach(function (policyPath) {
    require(path.resolve(policyPath)).invokeRolesPolicies();
  });
};

/**
 * Configure the modules server routes
 */
module.exports.initModulesServerRoutes = function (app) {
  // Globbing routing files
  config.files.server.routes.forEach(function (routePath) {
    require(path.resolve(routePath))(app);
  });
};

/**
 * Configure error handling
 */
module.exports.initErrorRoutes = function (app) {
  app.use(function (err, req, res, next) {
    // If the error object doesn't exists
    if (!err) {
      return next();
    }

    // Log it
    console.error(err.stack);

    // Redirect to error page
    res.redirect('/server-error');
  });
};

/**
 * Configure Socket.io
 */
module.exports.configureSocketIO = function (app, db) {
  // Load the Socket.io configuration
  var server = require('./socket.io')(app, db);

  // Return server object
  return server;
};

/**
 * Initialize the Express application
 */
module.exports.init = function (db) {
  // Initialize express app
  var app = express();

  // Initialize local variables
  this.initLocalVariables(app);

  // Initialize Express middleware
  this.initMiddleware(app);

  // Initialize Express view engine
  this.initViewEngine(app);

  // Initialize Express session
  this.initSession(app, db);

  // Initialize Modules configuration
  this.initModulesConfiguration(app);

  // Initialize Helmet security headers
  this.initHelmetHeaders(app);

  // Initialize modules static client routes
  this.initModulesClientRoutes(app);

  // Initialize modules server authorization policies
  this.initModulesServerPolicies(app);

  // Initialize modules server routes
  this.initModulesServerRoutes(app);

  // Initialize error routes
  this.initErrorRoutes(app);

  // Configure Socket.io
  app = this.configureSocketIO(app, db);

  return app;
};
