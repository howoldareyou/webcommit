'use strict';

const svn = require('node-svn-ultimate');
const path = require('path');
const fs = require('fs-extra');

const { getType } = require('../utils/utils');
const Service = require('../common/baseService');

const svnConfig = require('../../config/svnConfig.json');

function svnCall(cmd, ...arg) {
  return new Promise((resolve, reject) => {
    svn.commands[cmd](...arg, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

class SvnService extends Service {
  constructor(option) {
    super(option);
    this.rootPath = svnConfig.path;
  }

  async callFn(...arg) {
    try {
      return await svnCall(...arg);
    } catch (error) {
      console.log(error);
      this.error('访问SVN服务器失败');
    }
  }

  async log(filepath, limit = 10) {
    const fpath = filepath || path.join(this.rootPath, this.ctx.session.username);
    const { logentry } = await this.callFn('log', fpath, {
      // trustServerCert: false,
      // quiet: true,
      params: [ '-l ' + limit, '-r HEAD:0', '-v' ],
    });
    if (getType(logentry) === 'array') return logentry;
    return [ logentry ];
  }

  async add(file) {
    await this.callFn('add', file);
  }

  async commit(fileList, msg) {
    const tmpdir = this.ctx.app.config.multipart.tmpdir;
    const svnPath = path.join(this.rootPath, this.ctx.session.username);

    const files = [];
    for (let i = 0; i < fileList.length; i++) {
      const [ name, id ] = fileList[i];
      const filePath = path.join(svnPath, name);
      try {
        await fs.move(path.join(tmpdir, id), filePath, { overwrite: true });
      } catch (error) {
        this.error('获取文件失败，请重新上传文件');
      }
      files.push(filePath);
    }
    try {
      await this.add(files);
    } catch (e) {
      console.log();
    }
    const info = await this.callFn('commit', files, {
      params: [ '-m "' + msg.replace(/"/g, '\\"') + '"' ],
    });
    return info;
  }

  async update() {
    const svnPath = path.join(this.rootPath, this.ctx.session.username);
    await this.callFn('update', svnPath);
  }
}

module.exports = SvnService;
