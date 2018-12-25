import React, { PureComponent } from 'react';
import { Button, List, Spin, message } from 'antd';
import moment from 'moment';

import request from './request';
import styles from './webStyle.less';

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

function encodeFiles(list) {
  const str = JSON.stringify(list);
  const arr = [];
  for (let i = str.length - 1; i >= 0; i -= 1) {
    arr.push((str.charCodeAt(i) + i + 66).toString(16).replace(/f/g, 'g'));
  }
  return arr.join('f');
}

function getFileUrl(item) {
  return `/loadFile?file=${encodeFiles([item.name])}`;
}

export default class Download extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      files: [],
    };
  }

  componentDidMount() {
    this.loadFiles();
  }

  loadFiles() {
    const { loading } = this.state;
    if (loading) {
      message.info('正在加载，请稍后...');
      return;
    }
    this.setState({ loading: true });
    this.load = request({
      url: '/getFiles',
      fnOk: this.handleLoadOk,
      fnErr: this.handleLoadErr,
    });
  }

  handleUpdate = () => {
    const { loading } = this.state;
    if (loading) {
      message.info('正在加载，请稍后...');
      return;
    }
    this.setState({ loading: true });
    request({
      url: '/updateVersion',
      fnOk: () => {
        this.setState({ loading: false });
        message.success('更新成功');
        this.loadFiles();
      },
      fnErr: this.handleLoadErr,
    });
  }

  handleLoadErr = () => {
    this.setState({
      loading: false,
    });
  }

  handleLoadOk = (data) => {
    this.setState({
      loading: false,
      files: data.files,
    });
  }

  render() {
    const { files, loading } = this.state;

    return (
      <div className={styles.download} >
        <Button style={{ float: 'right' }} onClick={this.handleUpdate} type="primary" ghost>更新当前目录</Button>
        <div className={styles.filetitle}>当前共有 {files.length} 个文件</div>
        <Spin spinning={loading} tip="Loading...">
          <List
            locale={{
              emptyText: '无文件',
            }}
            dataSource={files}
            renderItem={item => (
              // eslint-disable-next-line react/jsx-no-target-blank
              <List.Item key={item.name} actions={[<a target="_blank" href={getFileUrl(item)}>下载</a>]}>
                <List.Item.Meta
                  title={item.name}
                  description={`创建时间: ${moment(item.creatTime * 1000).format('YYYY-MM-DD HH:mm:ss')}, 文件大小：${toHumanSize(item.size)}`}
                />
              </List.Item>
            )}
          />
        </Spin>
      </div>
    );
  }
}
