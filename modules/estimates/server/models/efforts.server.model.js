/**
 * Created by Rajesh on 6/7/2018.
 */
'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Efforts Schema
 */

var EffortsSchema = new Schema({
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
    prismId:{type: String},
    month: {type: String},
    lastName: {type: String},
    firstName: {type: String},
    attUID: {type: String},
    hours: {type: String},
    role: {type: String},
    status:{type: String,
        default: 'NEW',
        enum: ['NEW', 'PROCESSED']}
});

mongoose.model('Efforts', EffortsSchema);
