'use strict';

const path = require('path');

const Service = require('../common/baseService');
const { readJson, writeJson } = require('../utils/utils');

class UserService extends Service {
  constructor(option) {
    super(option);
    this.storePath = path.join(this.ctx.app.baseDir, 'config/user.json');
  }

  async get(name) {
    const list = await this.loadUserList();
    if (!list) return null;
    return list.find(el => el.name === name);
  }

  async set(name, data) {
    const list = await this.loadUserList();
    const newlist = [];
    list.forEach(el => {
      newlist.push(el.name === name ? data : el);
    });
    await writeJson(this.storePath, newlist);
  }

  async loadUserList() {
    try {
      return await readJson(this.storePath);
    } catch (error) {
      this.error('读取用户信息失败，请重试。。。');
    }
  }
}

module.exports = UserService;
