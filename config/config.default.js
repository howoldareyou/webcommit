'use strict';
const path = require('path');

module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1545568083871_5467';

  // add your config here
  config.middleware = [ 'errorCatch' ];

  config.session = {
    maxAge: 3600 * 1000, // ms
    key: 'DBAUDITSESSID',
    httpOnly: true,
    encrypt: true,
  };

  config.static = {
    prefix: '/',
  };

  config.customLogger = {
    scheduleLogger: {
      consoleLevel: 'NONE',
      file: path.join(appInfo.baseDir, 'logs', 'web_schedule.log'),
    },
  };

  config.logger = {
    level: 'INFO',
    allowDebugAtProd: false,
    consoleLevel: 'DEBUG',
    dir: path.join(appInfo.baseDir, 'logs'),
    appLogName: 'web_console.log',
    coreLogName: 'web_core.log',
    agentLogName: 'web_agent.log',
    errorLogName: 'web_error.log',
  };

  config.i18n = {
    defaultLocale: 'zh-CN',
    cookieField: 'locale',
    cookieMaxAge: '1y',
  };

  config.bodyParser = {
    jsonLimit: '10mb',
    formLimit: '10mb',
  };

  exports.validate = {};

  config.multipart = {
    whitelist: () => true,
    fileSize: 2 * 1024 * 1024 * 1024,
  };

  return config;
};
