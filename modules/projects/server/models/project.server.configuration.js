/**
 * Created by Rajesh on 6/17/2017.
 */
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Project configuration Schema
 */

var ConfigurationSchema = new Schema({
    createdOn: {
        type: Date,
        default: Date.now
    },
    modifiedOn: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: String,
        default: 'Admin',
        trim: true
    },
    modifiedBy: {
        type: String,
        default: 'Admin',
        trim: true
    },
    configName:{type:String},
    status:[{
        key:{type: String},
        value:{type: String}
    }],
    projectImpact:[{
        key:{type: String},
        value:{type: String}
    }],
    complexity:[{
        key:{type: String},
        value:{type: String}
    }],
    applications:[{
        key:{type: String},
        value:{type: String}
    }],
    solutionStatus:[{
        key:{type: String},
        value:{type: String}
    }],
    solutionAligned:[{
        key:{type: String},
        value:{type: String}
    }],
    phaseStatus:[{
        key:{type: String},
        value:{type: String}
    }],
    currentPhase:[{
        key:{type: String},
        value:{type: String}
    }],
    workstream:[{
        key:{type: String},
        value:{type: String}
    }],
    detsArchitect:[{
        key:{type: String},
        value:{type: String}
    }],
    supportedProducts:[{
        key:{type: String},
        value:{type: String}
    }],
    mailTemplates:[{
        key:{type: String},
        content:{
            from:{type: String},
            to:{type: String},
            subject:{type: String},
            body:{type: String},
            domain: {type: String}
        }
    }]

});

mongoose.model('Configuration', ConfigurationSchema);
