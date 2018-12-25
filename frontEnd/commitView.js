import React, { PureComponent } from 'react';
import { Row, Col } from 'antd';

import Upload from './upload';
import CommitForm from './commitForm';
import styles from './webStyle.less';

export default class commitView extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      hasFile: false,
    };
    this.fileList = [];
  }

  handleGetFiles = () => {
    return this.fileList;
  }

  handleCommitOk = () => {
    const { gotoLog } = this.props;
    gotoLog();
  }

  handleOnFileChange = (fileList) => {
    this.fileList = fileList;
    if (fileList.length !== this.fileCount) {
      this.fileCount = fileList.length;
      this.setState({ hasFile: this.fileCount > 0 });
    }
  }

  render() {
    const { hasFile } = this.state;

    const warpclass = hasFile ? `${styles.filewarp} ${styles.hasfile}` : styles.filewarp;
    return (
      <Row gutter={hasFile ? 40 : 0}>
        <Col span={hasFile ? 16 : 24}>
          <div className={warpclass}>
            {hasFile && (
              <div className={styles.filetitle}>已选择 {this.fileCount} 个需要提交的文件</div>
            )}
            <Upload onFileChange={this.handleOnFileChange} />
          </div>
        </Col>
        {hasFile && (
          <Col span={8} className={styles.commitwarp}>
            <div className={styles.filetitle}>提交文件的消息</div>
            <div style={{ marginTop: 12 }}>
              <CommitForm getFiles={this.handleGetFiles} onOk={this.handleCommitOk} />
            </div>
          </Col>
        )}
      </Row>
    );
  }
}
