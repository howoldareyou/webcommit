'use strict';

module.exports = () => {
  return async function errorCatch(ctx, next) {
    const sTime = new Date().getTime();
    try {
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
