/**
 * Created by Rajesh on 11/02/2017.
 */
'use strict';

/**
 * Module dependencies.
 */
var thirdpartyPolicy = require('../policies/thirdparty.server.policy'),
    thirdparty = require('../controllers/thirdparty.server.controller');

module.exports = function (app) {
    // GET DSP Project List
    app.route('/api/thirdparty/dsp/projects/list').get(thirdpartyPolicy.isAllowed,thirdparty.getDSPProjectList);
    //Get DSP Project Detail
    app.route('/api/thirdparty/dsp/projects/detail').post(thirdpartyPolicy.isAllowed,thirdparty.getDSPProjectDetailAsync);
};
