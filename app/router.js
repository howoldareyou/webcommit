'use strict';

module.exports = app => {
  const { router, controller, middlewares, config } = app;
  const ctrl = controller.main;

  const multipart = middlewares.multipart({
    tmpdir: config.multipart.tmpdir,
  });

  router.get('/', ctrl.index);
  router.get('/session', ctrl.session);
  router.get('/getLog', ctrl.getLog);
  router.get('/getFiles', ctrl.getFiles);
  router.get('/loadFile', ctrl.loadFile);
  router.get('/updateVersion', ctrl.updateVersion);

  router.post('/uploadFile', multipart, ctrl.uploadFile);
  router.post('/login', ctrl.login);
  router.post('/logout', ctrl.logout);
  router.post('/commit', ctrl.commit);
  router.post('/newPassword', ctrl.newPassword);

};
