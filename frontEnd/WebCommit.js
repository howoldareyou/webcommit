import React, { PureComponent } from 'react';
import { Layout, Menu, Avatar, Dropdown, Icon, Modal } from 'antd';

import request from './request';
import CommitView from './commitView';
import LogView from './logView';
import Download from './download';
import Login from './login';
import NewPasswd from './newPasswd';
import styles from './webStyle.less';

import userImg from './default_family.png';
import logoImg from './logo.png';

const { Header, Content } = Layout;

export default class WebCommit extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      username: null,
      setPasswd: false,
      type: 'in',
      menuKey: 'commit',
    };

    this.fromCard = <CommitView gotoLog={this.handleGotoLog} />;
    this.logCard = <LogView />;
    this.downloadCard = <Download />;

    this.menu = (
      <Menu className={styles.menu} onClick={this.handleOnMenuClick}>
        <Menu.Item key="newPasswd">
          <Icon type="edit" /> 修改密码
        </Menu.Item>
        <Menu.Item key="logout">
          <Icon type="logout" /> 退出登录
        </Menu.Item>
      </Menu>
    );
  }

  componentDidMount() {
    this.loadSession();
  }

  loadSession() {
    request({
      url: '/session',
      fnOk: this.handleLoadSessionOk,
    });
  }

  handleLoadSessionOk = (data) => {
    const type = data.type || 'in';
    const defautKey = type === 'in' ? 'commit' : 'download';

    this.setState({
      username: data.session && data.session.username ? data.session.username : '',
      type,
      menuKey: defautKey,
    });

    window.uploadLimit = data.uploadLimit;
  }

  handleMenuChange = (item) => {
    this.setState({
      menuKey: item.key,
    });
  }

  handleGotoLog = () => {
    this.setState({
      menuKey: 'log',
    });
  }

  handleOnMenuClick = (item) => {
    if (item.key === 'logout') {
      this.handleLogout();
    } else if (item.key === 'newPasswd') {
      this.setState({ setPasswd: true });
    }
  }

  handleCloseNewPasswd = () => {
    this.setState({ setPasswd: false });
  }

  handleLoginOk = () => {
    this.loadSession();
  }

  handleLogout= () => {
    request({
      url: '/logout',
      method: 'POST',
      fnOk: () => {
        this.setState({ username: '' });
      },
    });
  }

  render() {
    const { menuKey, username, setPasswd, type } = this.state;

    if (username === null) {
      return (
        <div className={styles.loginLoading}>
          <Icon type="loading" />
          <div>获取登录信息，请稍后...</div>
        </div>
      );
    }
    return (
      <Layout className={styles.layout}>
        <Modal visible={!username} title="登录" footer={false} closable={false}>
          {username === '' && <Login onLogin={this.handleLoginOk} />}
        </Modal>
        {username && (
          <Header className={styles.header}>
            <NewPasswd
              visible={setPasswd}
              onCancel={this.handleCloseNewPasswd}
              onOk={this.handleCloseNewPasswd}
            />
            <div style={{ float: 'right' }}>
              <Dropdown overlay={this.menu}>
                <span className={styles.user}>
                  <Avatar src={userImg} style={{ marginRight: 12, marginTop: -4 }} /><span>{username} <Icon type="down" /></span>
                </span>
              </Dropdown>
            </div>
            <div className={styles.logo}>
              <img style={{ width: 24, height: 24, marginRight: 6 }} src={logoImg} alt="logo" />
              <span style={{ marginRight: 5 }}>茶马小道</span>
              {type === 'in' ? <span style={{ color: '#eb2f96', fontSize: '12px' }}>- 西域</span> : <span style={{ color: '#faad14', fontSize: '12px' }}>- 中原</span>}
            </div>
            <Menu
              theme="dark"
              mode="horizontal"
              onClick={this.handleMenuChange}
              selectedKeys={[menuKey]}
              style={{ lineHeight: '50px' }}
            >
              {type === 'in' && <Menu.Item key="commit">提交</Menu.Item>}
              {type === 'in' && <Menu.Item key="log">日志</Menu.Item>}
              {type === 'out' && <Menu.Item key="download">下载</Menu.Item>}
            </Menu>
          </Header>
        )}
        {username && (
          <Content className={styles.content}>
            {menuKey === 'commit' && this.fromCard}
            {menuKey === 'log' && this.logCard}
            {menuKey === 'download' && this.downloadCard}
          </Content>
        )}
      </Layout>
    );
  }
}
