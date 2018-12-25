'use strict';
const fs = require('fs');
const path = require('path');
const moment = require('moment');

const Controller = require('../common/baseController');
const { getType, readDir } = require('../utils/utils');
const svnConfig = require('../../config/svnConfig.json');

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

function fileInfo(file) {
  return new Promise((resolve, reject) => {
    fs.stat(file, async (err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve(stats);
      }
    });
  });
}

class HomeController extends Controller {
  // 入口url，返回index.html
  async index() {
    this.ctx.redirect('/index.html');
  }

  // 获取session信息
  async session() {
    this.success({
      session: this.ctx.session,
      type: svnConfig.type || 'in',
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
      message: { type: 'string', max: 64 },
    });
    const { files, message } = this.ctx.request.body;
    const fileList = decodeFiles(files);

    await this.service.svn.commit(fileList, message);

    this.success();
  }

  // 获取提交日志
  async getLog() {
    const logs = await this.service.svn.log();
    this.success({
      log: logs.map(el => {
        let str = '';
        if (el.date) {
          str += moment(el.date).format('YYYY-MM-DD HH:mm:ss') + '\n';
        }
        if (el.msg) {
          str += el.msg + '\n';
        }
        if (el.paths && el.paths.path) {
          if (getType(el.paths.path) === 'array') {
            str += el.paths.path.map(p => p.$.action + ' ' + p._).join('\n') + '\n';
          } else {
            str += el.paths.path.$.action + ' ' + el.paths.path._ + '\n';
          }
        }
        return str;
      }).join('\n'),
    });
  }

  // 获取提交日志
  async updateVersion() {
    await this.service.svn.update();
    this.success();
  }

  // 获取文件
  async getFiles() {
    const files = [];
    try {
      const filelist = await readDir(path.join(svnConfig.path, this.ctx.session.username));
      for (let i = 0; i < filelist.length; i++) {
        const el = filelist[i];
        if (el.isdir) continue;
        const info = await fileInfo(el.path);

        files.push({
          name: el.name,
          creatTime: moment(info.ctime).unix(),
          size: info.size,
        });
      }
    } catch (error) {
      this.error('访问您的目录出错了...');
    }

    files.sort((a, b) => b.creatTime - a.creatTime);
    this.success({ files });
  }

  // 下载文件
  async loadFile() {
    const data = {};
    const fileArg = this.ctx.queries.file;
    if (fileArg && fileArg.length > 0) {
      data.file = fileArg[0];
    }

    this.ctx.validate({
      file: 'string',
    }, data);

    const fileList = decodeFiles(data.file);
    const filepath = path.join(path.join(svnConfig.path, this.ctx.session.username), fileList[0]);
    this.download(filepath, fileList[0]);

  }
}

module.exports = HomeController;
