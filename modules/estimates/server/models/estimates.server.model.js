/**
 * Created by Rajesh on 7/3/2017.
 */
'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Estimates Schema
 */

var EstimatesSchema = new Schema({
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
        required: 'Estimates required a valid project to associate'
    },
    pmtId:{type: String},
    estimates:{
        estType: {
            key: {
                type: String,
                default: 'MDE',
                enum: ['MDE', 'DDE1', 'DDE2']
            },
            value:{type:String}
        },
        hours: {type: Number},
        teamHours:{
            dets: {type: Number},
            tfa: {type: Number},
            dm: {type: Number}
        },
        cost: {type: Number},
        originalComplexity: {
            key: {
                type: String,
                enum: ['EA', 'MO', 'DI', 'CO']
            },
            value:{type:String}
        },
        complexity: {
            key: {
                type: String,
                enum: ['EA', 'MO', 'DI', 'CO']
            },
            value:{type:String}
        },
        impactedWorkstreams: [{
            key: {
                type: String
            },
            value:{type:String}
        }],
        assumptions: {type: String},
        dependencies: {type: String},
        additionalNotes: {type: String},
        sanityCheckOnEstimate: {
            type: String,
            default: 'NO',
            enum:['YES','NO']
        },
        estimateValid: {
            type: String,
            default: 'NO',
            enum:['YES','NO']
        },
        reasonForEstimateFailure: {type:String}
    },
    keywords: [String]
});

mongoose.model('Estimates', EstimatesSchema);
