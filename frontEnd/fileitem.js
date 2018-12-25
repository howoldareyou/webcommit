import React, { Component } from 'react';
import { Icon, Progress } from 'antd';

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
function toHumanTime(ms) {
  if (ms > 3600000) {
    return `${Math.round(ms / 3600000)}小时`;
  } else if (ms > 60000) {
    return `${Math.round(ms / 60000)}分钟`;
  }
  return `${Math.round(ms / 1000)}秒`;
}

export default class fileitem extends Component {
  constructor(props) {
    super(props);
    this.startTime = +new Date();
    this.lastTime = this.startTime;
    this.lastPercent = 0;
  }

  shouldComponentUpdate(nextProps) {
    if (this.finish) return false;
    const { item } = nextProps;
    if (item.response) {
      this.finish = true;
      this.finishTime = +new Date();
    }
    return true;
  }

  getSpeed() {
    const { item } = this.props;
    if (item.percent === 100) {
      return `${toHumanSize((item.size * item.percent) / 100)}`;
    }

    const now = +new Date();
    const cost = now - this.lastTime;
    if (cost < 1000) return this.speedDesc || '';

    const speed = (item.size * (item.percent - this.lastPercent) * 10) / cost;
    const needTime = (item.size * (100 - item.percent) * 10) / (speed || 1);
    this.lastPercent = item.percent;
    this.lastTime = now;

    this.speedDesc = `${toHumanSize(speed)}/s (${toHumanSize((item.size * item.percent) / 100)}/${toHumanSize(item.size)}, 大约${toHumanTime(needTime)})`;
    return this.speedDesc;
  }

  render() {
    const { onFileClose, item } = this.props;
    let status = 'active';
    let itemClass = 'ant-upload-list-item-uploading';
    let icon = <Icon type="loading" />;

    if (item.error || (item.response && item.response.success !== true)) {
      status = 'exception';
      itemClass = 'ant-upload-list-item-error';
      icon = <Icon style={{ color: '#f5222d' }} type="close-circle" />;
    } else if (item.percent === 100) {
      status = 'success';
      itemClass = 'ant-upload-list-item-done';
      icon = <Icon style={{ color: '#52c41a' }} type="check-circle" />;
    }
    return (
      <div key={item.uid} className={`ant-upload-list-item ${itemClass}`}>
        <div className="ant-upload-list-item-info">
          <span>
            <span className="ant-upload-list-item-speed">{item.error ? '出错了，请刷新页面重试' : this.getSpeed()}</span>
            {icon}
            <span className="ant-upload-list-item-name" title={item.name}>{item.name}</span>
          </span>
        </div>
        <Icon title="删除文件" type="close" onClick={() => { onFileClose(item); }} />
        <div className="ant-upload-list-item-progress">
          <Progress showInfo={false} strokeWidth={4} percent={item.percent} status={status} />
        </div>
      </div>
    );
  }
}
