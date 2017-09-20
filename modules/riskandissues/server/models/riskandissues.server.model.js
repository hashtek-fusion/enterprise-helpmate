/**
 * Created by Rajesh on 9/7/2017.
 */
'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Risk And Issues Schema
 */

var RiskAndIssuesSchema = new Schema({
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
    projectId: {
        type: Schema.ObjectId,
        ref: 'Project',
        required: 'Risk And Issues required a valid project to associate'
    },
    pmtId:{
      type: String
    },
    release: {
        type: Number,
        trim: true
    },
    designPhase: {
        key:{type: String, enum: ['0','1','2']},
        value:{type:String}
    },
    issueStatus: {
        key: {
            type: String,
            default: 'OPEN',
            enum: ['OPEN', 'RESOLVED', 'BLOCKED', 'IN_PROGRESS']
        },
        value:{type:String}
    },
    priority: {
        key: {
            type: String,
            default: 'LOW',
            enum: ['HIGH', 'MEDIUM', 'LOW']
        },
        value:{type:String}
    },
    ownedBy: {type: String},
    riskAndIssue: {type: String},
    raisedOn:{
        type: Date
    },
    raisedBy:{type: String},
    resolution: {type: String},
    closedOn: {
        type: Date
    },
    reason :{type: String},
    comments: {type: String},
    keywords: [String]
});

mongoose.model('RiskAndIssues', RiskAndIssuesSchema);
