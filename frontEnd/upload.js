import React, { PureComponent } from 'react';
import { Upload, Icon, notification, message } from 'antd';
import cookies from 'browser-cookies';

import Filebwarp from './filelist';

export default class upload extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      fileList: [],
    };
    this.needUpFiles = [];
    this.header = { 'x-csrf-token': cookies.get('csrfToken') };
  }

  getDragger = (el) => {
    this.Dragger = el;
  }

  handleUploadChange = (info) => {
    const { fileList, file } = info;
    const { onFileChange } = this.props;


    const fl = fileList.filter(this.handleCheckFile);
    this.setState({ fileList: fl });

    if (file.response && file.response.success !== true) {
      notification.error({
        message: file.response.message,
        description: `文件: ${file.name}`,
      });
    }

    onFileChange(fl);
  }

  handleCheckFile = (file) => {
    const { fileList } = this.state;
    if (file.size > window.uploadLimit) {
      message.error(`文件大小超过2G: ${file.name}`);
      return false;
    }
    const exist = fileList.some(el => el.uid !== file.uid && el.lastModified === file.lastModified && el.name === file.name && el.size === file.size);
    if (exist) {
      message.error(`文件已存在: ${file.name}`);
      return false;
    }

    return true;
  }

  handleRemoveFile = (file) => {
    const { fileList } = this.state;
    const { onFileChange } = this.props;
    const fl = fileList.filter(el => el.uid !== file.uid);
    this.setState({
      fileList: fl,
    });
    onFileChange(fl);
  }

  render() {
    const { fileList } = this.state;
    return (
      <span>
        <Upload
          fileList={fileList}
          type="drag"
          showUploadList={false}
          ref={this.getDragger}
          multiple
          headers={this.header}
          onChange={this.handleUploadChange}
          name="file"
          action="/uploadFile"
        >
          {fileList.length > 0 ? (
            <a><Icon type="upload" /> 继续添加文件</a>
          ) : (
            <div>
              <p className="ant-upload-drag-icon">
                <Icon type="inbox" />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到这里上传</p>
            </div>
          )}
        </Upload>
        <Filebwarp fileList={fileList} onFileClose={this.handleRemoveFile} />
      </span>
    );
  }
}
