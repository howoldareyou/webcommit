'use strict';

const Subscription = require('egg').Subscription;
const fs = require('mz/fs');
const rimraf = require('mz-modules/rimraf');
const moment = require('moment');

const { readDir } = require('../utils/utils');

class tasksEveryDaySchedule extends Subscription {
  static get schedule() {
    return {
      // cron: '0 0 0 * * *',
      interval: '600s',
      type: 'worker', // 指定单个的 worker 执行
    };
  }

  async _remove(dir) {
    const { ctx } = this;
    if (await fs.exists(dir)) {
      ctx.logger.info('[egg-multipart:CleanTmpdir] removing tmpdir: %j', dir);
      try {
        await rimraf(dir);
        ctx.logger.info('[egg-multipart:CleanTmpdir:success] tmpdir: %j has been removed', dir);
      } catch (err) {
        ctx.logger.error('[egg-multipart:CleanTmpdir:error] remove tmpdir: %j error: %s',
          dir, err);
        ctx.logger.error(err);
      }
    }
  }

  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe() {
    const { ctx } = this;
    const tmpdir = ctx.app.config.multipart.tmpdir;
    ctx.logger.info('[egg-multipart:CleanTmpdir] start clean tmpdir: %j', tmpdir);

    const deadline = moment().subtract(1, 'days').format('YYYYMMDD');

    const dirs = await readDir(tmpdir, false);

    for (let i = 0; i < dirs.length; i++) {
      const dir = dirs[i];
      if (dir.name < deadline) {
        await this._remove(dir.path);
      }
    }

    ctx.logger.info('[egg-multipart:CleanTmpdir] end');
  }
}

module.exports = tasksEveryDaySchedule;
