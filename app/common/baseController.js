'use strict';
const fs = require('fs');
const Controller = require('egg').Controller;
const { userErr } = require('../utils/utils');

class BaseController extends Controller {
  // 成功的返回，并中断后续的逻辑
  success(data) {
    this.ctx.body = {
      code: '200',
      message: 'success',
      success: true,
      data,
    };

    const err = new Error();
    err.code = 0;
    throw err;
  }

  // 发生错误时，用于抛出异常，并终止后续的逻辑
  error(msg) {
    throw userErr(msg);
  }

  download(path, filename) {
    this.ctx.set('Content-Type', 'application/octet-stream');
    this.ctx.attachment(filename || 'file');
    const rs = fs.createReadStream(path);
    this.ctx.body = rs;
  }

}

module.exports = BaseController;
