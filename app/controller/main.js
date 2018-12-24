'use strict';

const Controller = require('../common/baseController');

function decodeFiles(str) {
  const arr = str.split('f');
  let p = 0;
  let jsonStr = '';
  for (let i = arr.length - 1; i >= 0; i -= 1) {
    jsonStr += String.fromCharCode(parseInt(arr[i].replace(/g/g, 'f'), 16) - 66 - p);
    p += 1;
  }
  try {
    return JSON.parse(jsonStr);
  } catch (error) {
    return null;
  }
}

class HomeController extends Controller {
  // 入口url，返回index.html
  async index() {
    this.ctx.body = 'hi, egg';
  }

  // 获取session信息
  async session() {
    this.success({
      session: this.ctx.session,
      uploadLimit: this.app.config.multipart.fileSize,
    });
  }

  // 登录
  async login() {
    this.ctx.validate({
      username: 'string',
      password: 'string',
    });
    const { username, password } = this.ctx.request.body;
    const user = await this.service.user.get(username);
    if (user && user.password === password) {
      this.ctx.session.username = username;
      this.success({ username });
    }
    this.error('用户名或密码错误！');
  }

  // 登出
  async logout() {
    this.ctx.session = null;
    this.success();
  }

  // 修改密码
  async newPassword() {
    this.ctx.validate({
      oldpwd: 'string',
      newpwd: 'string',
    });
    const { oldpwd, newpwd } = this.ctx.request.body;

    const user = await this.service.user.get(this.ctx.session.username);
    if (user && user.password === oldpwd) {
      user.password = newpwd;
      await this.service.user.set(this.ctx.session.username, user);
      this.success();
    }
    this.error('用户名或密码错误！');
  }

  // 上传文件
  async uploadFile() {
    const file = this.ctx.request.files[0];
    this.success({
      fileId: file.fileId,
    });
  }

  // 提交文件和消息
  async commit() {
    this.ctx.validate({
      files: 'string',
      message: 'string',
    });
    const { files, message } = this.ctx.request.body;
    const fileList = decodeFiles(files);

    this.success({ fileList, message });
  }

  // 获取提交日志
  async getLog() {
    this.success({
      log: 'zhanglizhanglizhanglizhanglizhanglizhanglizhanglizhangli',
    });
  }
}

module.exports = HomeController;
