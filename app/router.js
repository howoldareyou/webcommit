'use strict';
const path = require('path');

module.exports = app => {
  const { router, controller, middlewares } = app;
  const ctrl = controller.main;

  const multipart = middlewares.multipart({
    tmpdir: path.join(app.baseDir, 'temp'),
  });

  router.get('/', ctrl.index);
  router.get('/session', ctrl.session);
  router.get('/getLog', ctrl.getLog);

  router.post('/uploadFile', multipart, ctrl.uploadFile);
  router.post('/login', ctrl.login);
  router.post('/logout', ctrl.logout);
  router.post('/commit', ctrl.commit);
  router.post('/newPassword', ctrl.newPassword);

};
