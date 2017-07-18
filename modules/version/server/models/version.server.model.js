/**
 * Created by Rajesh on 7/18/2017.
 */
'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Project Schema
 */

var VersionSchema = new Schema({
    createdOn: {
        type: Date,
        default: Date.now
    },
    modifiedOn: {
        type: Date
    },
    createdBy: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    modifiedBy: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    pmtId: {
        type: String,
        default: '',
        trim: true,
        required: 'PMT ID cannot be blank',
        unique: 'Project already versioned'
    },
    versions:[]
});

mongoose.model('ProjectHistory', VersionSchema);
