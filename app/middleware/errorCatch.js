'use strict';

function userErr(message = '', code) {
  const err = new Error();
  err.code = 'user_error';
  err.message = message;
  if (code) err.errCode = code;
  return err;
}

const noNeedLoginUrl = [
  '/',
  '/session',
  '/login',
];
module.exports = () => {
  return async function errorCatch(ctx, next) {
    const sTime = new Date().getTime();
    try {
      const searchStart = ctx.originalUrl.indexOf('?');
      const url = searchStart !== -1 ? ctx.originalUrl.substr(0, searchStart) : ctx.originalUrl;
      if (!noNeedLoginUrl.includes(url)) {
        if (!ctx.session || !ctx.session.username) {
          throw userErr('您还未登录，请先登录...');
        }
      }
      await next();
    } catch (e) {
      if (e.code !== 0) { // 发生错误
        if (e.code === 'invalid_param') {
          ctx.body = {
            code: '400',
            success: false,
            message: '参数错误',
          };
        } else if (e.code === 'user_error') {
          const code = e.errCode || 'error';

          ctx.body = {
            code,
            success: false,
            message: e.message,
          };
        } else if (e.code === 'Request_fileSize_limit') {
          ctx.body = {
            code: e.code,
            success: false,
            message: '上传文件大小超过限制',
          };
        } else {
          ctx.logger.error(e);
          ctx.body = {
            code: 'Dbaudit.serverError',
            success: false,
            message: '系统错误',
          };
        }
      }

      const requestTotalCost = new Date().getTime() - sTime;
      ctx.body.requestTotalCost = requestTotalCost;
    }
  };
};
