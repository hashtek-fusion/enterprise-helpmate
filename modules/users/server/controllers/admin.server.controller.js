'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash');
var path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  async= require('async'),
  Project = mongoose.model('Project'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Show the current user
 */
exports.read = function (req, res) {
  res.json(req.model);
};

/**
 * Update a User
 */
exports.update = function (req, res) {
  var user = req.model;

  //For security purposes only merge these parameters
  user.firstName = req.body.firstName;
  user.lastName = req.body.lastName;
  user.displayName = user.firstName + ' ' + user.lastName;
  user.roles = req.body.roles;
  user.status= req.body.status;
  user.jobTitle= req.body.jobTitle;
  user.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(user);
  });
};

/**
 * Delete a user
 */
exports.delete = function (req, res) {
  var user = req.model;

  user.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(user);
  });
};

/**
 * List of Users
 */
/*exports.list = function (req, res) {
  User.find({}, '-salt -password').sort('-created').populate('user', 'displayName').exec(function (err, users) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(users);
  });
};*/

/**
 * List of Users
 */
exports.list = function (req, res) {
    async.parallel([
        function(cb){
            User.find({}, '-salt -password').sort('-created').populate('user', 'displayName').exec(function (err, users) {
              cb(err, users);
            });
        },
        function(cb){
            Project.aggregate([
                {
                    $match:{
                        'status.key': {$nin:['CANCELLED','COMPLETED','CLOSED','ON_HOLD']}
                    }
                },
                {$unwind:'$roles.detsArchitect' },
                {
                    $group:{
                        _id: {architect:'$roles.detsArchitect.key'},
                        count: {$sum: 1}
                    }
                }
            ],function(err,projects){
               cb(err,projects);
            } );
        },
        function(cb){
            Project.aggregate([
                {
                    $match:{
                        'status.key': {$nin:['CANCELLED','COMPLETED','CLOSED','ON_HOLD']}
                    }
                },
                {$unwind:'$roles.assignedTFA' },
                {
                    $group:{
                        _id: {architect:'$roles.assignedTFA.key'},
                        count: {$sum: 1}
                    }
                }
            ],function(err,projects){
                cb(err,projects);
            } );
        },
        function(cb){
            Project.aggregate([
                {
                    $match:{
                        'status.key': {$nin:['CANCELLED','COMPLETED','CLOSED','ON_HOLD']}
                    }
                },
                {$unwind:'$roles.assignedDMTFA' },
                {
                    $group:{
                        _id: {architect:'$roles.assignedDMTFA.key'},
                        count: {$sum: 1}
                    }
                }
            ],function(err,projects){
                cb(err,projects);
            } );
        }
    ],function (err, response) {
        if(!err){
            var users= response[0];
            var tfaUsers= users.filter(function(u){
                return (u.jobTitle.key==='TFA');
            });
            var tfaDMUsers= users.filter(function(u){
                return (u.jobTitle.key==='DM');
            });
            var detsUsers= users.filter(function(u){
                return (u.jobTitle.key==='DETS');
            });
            var noroleUsers= users.filter(function(u){
                return (u.jobTitle.key==='NA');
            });
            var projectsDETS= response[1];
            var projectsTFA= response[2];
            var projectsDMTFA= response[3];
            var userList=[];
            detsUsers.forEach(function(user, index){
                var obj={};
                var userFiltered=_.find(projectsDETS,function(o){
                    return o._id.architect=== user.username;
                });
                if(userFiltered)
                    obj.activeProjects = userFiltered.count;
                else
                    obj.activeProjects = 0;
                _.merge(obj, user);
                userList.push(obj);
            });
            tfaUsers.forEach(function(user, index){
                var obj={};
                var userFiltered=_.find(projectsTFA,function(o){
                    return o._id.architect=== user.username;
                });
                if(userFiltered)
                    obj.activeProjects = userFiltered.count;
                else
                    obj.activeProjects = 0;
                _.merge(obj, user);
                userList.push(obj);
            });
            tfaDMUsers.forEach(function(user, index){
                var obj={};
                var userFiltered=_.find(projectsDMTFA,function(o){
                    return o._id.architect=== user.username;
                });
                if(userFiltered)
                    obj.activeProjects = userFiltered.count;
                else
                    obj.activeProjects = 0;
                _.merge(obj, user);
                userList.push(obj);
            });
            noroleUsers.forEach(function(user, index){
                var obj={};
                obj.activeProjects = 0;
                _.merge(obj, user);
                userList.push(obj);
            });
            res.json(_.sortBy(userList,'_doc.displayName'));
        }else{
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
    });
};

//List users in editor role to assign to specific projects
exports.listEditorUsers = function(req, res){
    User.find({roles:{$elemMatch:{$in:['editor','dm_editor','tfa_editor']}}, 'status.key':{$eq:'ACTIVE'}})
        .sort('firstName')
        .select('username displayName jobTitle').exec(function (err, users) {
          var editorUsers=[];
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }else{
            users.forEach(function(user){
                var tempObj ={
                    key: user.username,
                    value: user.displayName,
                    role: user.jobTitle.key
                };
                editorUsers.push(tempObj);
            });
            res.json(editorUsers);
        }
    });
};

/**
 * User middleware
 */
exports.userByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'User is invalid'
    });
  }

  User.findById(id, '-salt -password').exec(function (err, user) {
    if (err) {
      return next(err);
    } else if (!user) {
      return next(new Error('Failed to load user ' + id));
    }

    req.model = user;
    next();
  });
};
