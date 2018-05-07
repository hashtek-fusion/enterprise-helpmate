/**
 * Created by Rajesh on 6/8/2017.
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

var ProjectSchema = new Schema({
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
        unique: 'Project already exists'
    },
    status: {
        key: {
            type: String,
            default: 'ACTIVE',
            enum: ['ACTIVE', 'ON_HOLD', 'CANCELLED', 'COMPLETED','REQ','DEP','CLOSED']
        },
        value:{type:String}
    },
    impact: {
        key: {
            type: String,
            enum: ['DEV', 'TO', 'TI', 'NI']
        },
        value:{
            type:String
        }
    },
    description: {
        type: String
    },
    release: {
        type: Number,
        trim: true
    },
    roles: {
        detsArchitect: [{
            key: {
                type: String,
                trim: true,
                required: 'DETS architect cannot be blank'
            },
            value:{type:String}
        }],
        enterpriseArchitect: {
            type: String,
            default: '',
            trim: true
        },
        tsm: {
            type: String,
            default: '',
            trim: true
        },
        lpm: {
            type: String,
            default: '',
            trim: true
        },
        leadTFA: {
            type: String,
            default: '',
            trim: true
        },
        assignedTFA: [{
            key: {
                type: String,
                trim: true
            },
            value:{type:String}
        }],
        assignedDMTFA: [{//Data Mapping TFA role
            key: {
                type: String,
                trim: true
            },
            value:{type:String}
        }]
    },
    aisDetail:{
        currentPhase: {
            key:{type: String, enum: ['0','1','2']},
            value:{type:String}
            },
        phase1Status: {
           key: {
               type: String,
               default: 'NA',
               enum: ['NS', 'IP', 'OH', 'CO', 'NA']
           },
            value:{type:String}
        },
        phase2Status: {
           key: {
               type: String,
               default: 'NA',
               enum: ['NS', 'IP', 'OH', 'CO', 'NA']
           },
            value:{type:String}
        },
        solutionStatus: {
           key: {
               type: String,
               default: 'NA',
               enum: ['GREEN', 'AMBER', 'RED', 'NA']
           },
            value:{type:String}
        },
        solutionAligned: {
            key: {
                type: String,
                default: 'NA',
                enum: ['NO', 'YES', 'NA', 'PENDING']
            },
            value:{type:String}
        },
        solutionChangeReason: {
            type: String,
            default: 'N/A'
        },
        phase1Reviewed: {
            type: String,
            default: 'NO',
            enum:['YES','NO']
        },
        phase1ReviewComments:{type:String},
        solutionChangedInPhase2: {
            type: String,
            default: 'NO',
            enum:['YES','NO']
        }
    },
    hldDetail:{
        hldStatus: {
            key: {
                type: String,
                default: 'NA',
                enum: ['NS', 'IP', 'OH', 'CO', 'NA','WA']
            },
            value:{type:String}
        },
        deliveredOn: {type: Date},
        deliveredOntime: {
            type: String,
            default: 'N/A',
            enum:['YES','NO','N/A']
        },
        reasonForDelay:{type: String, default: 'N/A'}
    },
    tfaDeliverables:{
        documentStatus: {
            key: {
                type: String,
                default: 'NA',
                enum: ['NS', 'IP', 'OH', 'CO', 'NA','WA']
            },
            value:{type:String}
        },
        deliveredOn: {type: Date},
        deliveredOntime: {
            type: String,
            default: 'N/A',
            enum:['YES','NO','N/A']
        },
        documentLinks: {type: String},
        reasonForDelay:{type: String, default: 'N/A'},
        additionalNotes:{type: String}
    },
    dataMapping:{
        staticTest:{
            plannedStartDate:{type: Date},
            plannedEndDate:{type: Date},
            actualStartDate:{type: Date},
            actualEndDate:{type: Date},
            numberOfDefectsIdentified: {type:Number },
            percentageCompletion:{type: Number},
            reasonForDelay:{type: String, default: 'N/A'}
        },
        dynamicTest:{
            plannedStartDate:{type: Date},
            plannedEndDate:{type: Date},
            actualStartDate:{type: Date},
            actualEndDate:{type: Date},
            numberOfDefectsIdentified: {type:Number },
            percentageCompletion:{type: Number},
            reasonForDelay:{type: String, default: 'N/A'}
        },
        documentLinks: {type: String},
        additionalNotes:{type: String}
    },
    impactedApplication:{
        key: {
            type: String
        },
        value:{type:String}
    },
    dependencies:{type:String},
    impactedWorkstreams: [{
        key: {
            type: String
        },
        value:{type:String}
    }],
    safeProject: {
        type: String,
        default: 'NO',
        enum:['YES','NO','N/A']
    },
    supportedProducts: [{
        key: {
            type: String,
            default: 'NA',
            enum: ['AVPN', 'ADI', 'IPFLEX', 'CO', 'ADIOD','ASEOD','FW','SDWAN','NA','MOB']
        },
        value:{type:String}
    }],
    complexity: {
       key: {
           type: String,
           enum: ['EA', 'MO', 'DI', 'CO']
       },
        value:{
           type:String
       }
    },
    fundedOrganization: {type:String},
    initiativeProgram: {type:String},
    riskAndIssues:{
        raisedOn:{type: Date, default: Date.now()},
        comments: {type: String}
    },
    additionalNotes:{type: String},
    attachments:[String],
    keywords: [String]
});

mongoose.model('Project', ProjectSchema);
