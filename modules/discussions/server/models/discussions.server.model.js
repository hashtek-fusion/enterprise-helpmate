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
        key: {
            type: String
        },
        value:{type:String}
    },
    subTopic: {type: String,trim: true},
    description: {type: String,trim: true},
    notes:[{
        createdOn: {type: Date},
        modifiedOn: {type: Date},
        content : {type: String, trim: true},
        createdBy: {type: String},
        lastModifiedBy: {type: String}
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
        createdOn: {type: Date},
        createdBy: {type: String},
        lastModifiedBy: {type: String},
        modifiedOn: {type: Date}
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
