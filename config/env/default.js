'use strict';

module.exports = {
  app: {
    title: 'Enterprise Helpmate',
    description: 'This application helps the enterprise specific organization group to manage the project status, resource assignment, deliverable status and reports',
    keywords: 'project Helper, DETS Architect, Reports ',
    googleAnalyticsTrackingID: process.env.GOOGLE_ANALYTICS_TRACKING_ID || 'GOOGLE_ANALYTICS_TRACKING_ID'
  },
  port: process.env.PORT || 3000,
  templateEngine: 'swig',
  sessionSecret: 'HELPMATE',
  sessionCollection: 'helpmate-sessions',
  logo: 'modules/core/img/brand/logo.png',
  favicon: 'modules/core/img/brand/favicon.ico',
  uploadPath: 'D:/Rajesh/UI-Development/Uploads/'
};
