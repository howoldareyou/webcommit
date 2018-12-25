import React, { PureComponent } from 'react';
import { message } from 'antd';
import Login from 'components/Login';
import sha256 from 'js-sha256';

import request from './request';

const { UserName, Password, Submit } = Login;

export default class login extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      logining: false,
    };
  }

  handleLogin = (err, values) => {
    if (err) return;
    this.setState({ logining: true });
    request({
      url: '/login',
      method: 'POST',
      data: {
        username: values.username,
        password: sha256(values.password),
      },
      fnOk: this.handleLoginOk,
      fnErr: this.handleLoginErr,
    });
  }

  handleLoginOk = (data) => {
    const { onLogin } = this.props;
    this.setState({ logining: false });
    message.success('登录成功');
    onLogin(data.username);
  }

  handleLoginErr = () => {
    this.setState({ logining: false });
  }
  render() {
    const { logining } = this.state;

    return (
      <Login
        onSubmit={this.handleLogin}
      >
        <UserName name="username" placeholder="用户名" />
        <Password name="password" placeholder="密码" />
        <Submit loading={logining}>登录</Submit>
      </Login>
    );
  }
}
