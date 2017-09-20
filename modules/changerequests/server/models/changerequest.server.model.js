/**
 * Created by Rajesh on 6/28/2017.
 */
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Project ChangeRequest Schema
 */

var ChangeRequestSchema = new Schema({
    createdOn: {
        type: Date,
        default: Date.now
    },
    modifiedOn: {
        type: Date,
        default: Date.now
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
        required: 'Change request required a valid project to associate'
    },
    crNumber:{
        type: String,
        unique:'CR already exists'
    },
    description:{type: String},
    reason:{
        key:{
            type: String,
            enum: ['MI','SC','BC','FIN','OT']
        },
        value:{type: String}
    },
    status: {
        key: {
            type: String,
            default: 'REQ',
            enum: ['ACTIVE', 'ON_HOLD', 'CANCELLED', 'COMPLETED','REQ']
        },
        value:{type:String}
    },
    otherReason:{type:String},
    additionalNotes: {type: String},
    keywords: [String]
});

mongoose.model('ChangeRequest', ChangeRequestSchema);
