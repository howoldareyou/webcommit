import React, { PureComponent } from 'react';
import { Button, Spin, message, Affix } from 'antd';

import request from './request';
import styles from './webStyle.less';

export default class commitLog extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      log: '',
      loading: false,
    };
  }

  componentDidMount() {
    this.loadLog();
  }

  componentWillUnmount() {
    if (this.load) this.load();
  }

  loadLog = () => {
    const { loading } = this.state;
    if (loading) {
      message.info('正在加载，请稍后...');
      return;
    }
    this.setState({ loading: true });
    this.load = request({
      url: '/getLog',
      fnOk: this.handleLoadOk,
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
      log: data.log,
    });
  }

  render() {
    const { log, loading } = this.state;

    return (
      <div>
        <Spin spinning={loading} tip="Loading...">
          <pre className={styles.logwarp}>{log}</pre>
          <Affix offsetTop={60} style={{ position: 'absolute', top: 10, right: 10 }}>
            <Button onClick={this.loadLog} size="small" type="dashed" icon="redo" ghost>更新</Button>
          </Affix>
        </Spin>
      </div>
    );
  }
}
