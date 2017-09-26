/**
 * Created by Rajesh on 09/20/2017.
 */
'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Discussions Schema
 */

var DiscussionsSchema = new Schema({
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
        required: 'Discussion thread require a valid project to associate'
    },
    pmtId :{
      type: String
    },
    topic: {
        type: String,
        required: 'Discussion Topic is required',
        trim: true
    },
    subTopic: {type: String,trim: true},
    description: {type: String,trim: true},
    notes:[{
        createdOn: {type: Date, default:Date.now},
        content : {type: String, trim: true}
    }],
    actionItems:[{
        item:{type: String, trim: true},
        ownedBy: {type: String, trim: true},
        resolution: {type: String, trim: true},
        status: {
            key: {
                type: String,
                default: 'OPEN',
                enum: ['OPEN', 'RESOLVED', 'BLOCKED', 'IN_PROGRESS']
            },
            value:{type:String}
        },
        createdOn: {type: Date, default:Date.now},
    }],
    status: {
        key: {
            type: String,
            default: 'OPEN',
            enum: ['OPEN', 'CLOSED']
        },
        value:{type:String}
    },
    keywords: [String]
});

mongoose.model('Discussions', DiscussionsSchema);
