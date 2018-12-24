'use strict';

const Service = require('egg').Service;
const { userErr } = require('../utils/utils');

class BaseService extends Service {
  // 发生错误时，用于抛出异常，并终止后续的逻辑
  error(msg) {
    throw userErr(msg);
  }

}

module.exports = BaseService;
