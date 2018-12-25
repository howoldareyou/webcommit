'use strict';

const Service = require('../common/baseService');
const ddConfig = require('../../config/dingdingHook.json');

function toHumanSize(size) {
  if (size > 1073741824) {
    return `${(size / 1073741824).toFixed(2)}G`;
  } else if (size > 1048576) {
    return `${(size / 1048576).toFixed(2)}M`;
  } else if (size > 1024) {
    return `${(size / 1024).toFixed(2)}K`;
  }
  return `${size.toFixed(2)}B`;
}

class DingdingService extends Service {
  constructor(option) {
    super(option);
    this.hookUrl = ddConfig.hookUrl;
  }


  async send(data) {
    if (!this.hookUrl) return;
    const title = `${this.ctx.session.username}下载了一个外传文件`;
    const info = [ `#### ${title}` ];

    if (data.name) info.push(`###### 文件名称：${data.name}`);
    if (data.size) info.push(`###### 文件大小：${toHumanSize(data.size)}`);
    if (data.creatTime) info.push(`###### 传出时间：${data.creatTime}`);
    if (data.message) info.push(`###### 外传事由：${data.message}`);

    const postData = {
      msgtype: 'markdown',
      markdown: {
        title,
        text: info.join('\n'),
      },
    };
    // console.log(postData);
    await this.ctx.curl(this.hookUrl, {
      method: 'POST',
      contentType: 'json',
      data: postData,
      dataType: 'json',
    });
  }
}

module.exports = DingdingService;
