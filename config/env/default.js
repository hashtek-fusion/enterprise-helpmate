'use strict';

module.exports = {
  app: {
    title: 'DETS AIS Tracker',
    description: 'This application helps the enterprise specific organization group to manage the project status, resource assignment, deliverable status and reports',
    keywords: 'project Helper, DETS Architect, Reports ',
    googleAnalyticsTrackingID: process.env.GOOGLE_ANALYTICS_TRACKING_ID || 'GOOGLE_ANALYTICS_TRACKING_ID'
  },
  port: process.env.PORT || 3000,
  host: 'localhost',
  basePath: 'helpmate',
  templateEngine: 'swig',
  sessionSecret: 'HELPMATE',
  sessionCollection: 'helpmate-sessions',
  logo: 'modules/core/img/brand/logo.png',
  favicon: 'modules/core/img/brand/favicon.ico',
  uploadPath: 'D:/Rajesh/UI-Development/Uploads/',
  dspAPIBaseURL:'http://dsp.web.att.com/dsp-api/rest',  //Digital Solution Platform API base URL
  dspProjectsPath:'D:/Rajesh/UI-Development/Uploads/'
};
