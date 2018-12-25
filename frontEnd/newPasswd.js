import React, { PureComponent } from 'react';
import { Form, Input, message } from 'antd';
import sha256 from 'js-sha256';

import request from './request';
import Modal from './Modal';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 18 },
};

@Form.create()
export default class comfirmModal extends PureComponent {
  handleOnOk = () => {
    const { form } = this.props;
    form.validateFields({ force: true }, (err, values) => {
      if (err) return;
      request({
        url: '/newPassword',
        method: 'POST',
        data: {
          oldpwd: sha256(values.oldpwd),
          newpwd: sha256(values.newpwd),
        },
        fnOk: this.handleRequestOk,
      });
    });
  }

  handleRequestOk = () => {
    const { onOk } = this.props;
    message.success('密码修改成功');
    this.handleResetForm();
    onOk();
  }

  handleOnCancel = () => {
    const { onCancel } = this.props;
    this.handleResetForm();
    onCancel();
  }

  handleResetForm = () => {
    const { form } = this.props;
    form.setFieldsValue({
      oldpwd: '',
      newpwd: '',
      cfpwd: '',
    });
  }

  handleNewPasswdChange = (val) => {
    const { form } = this.props;
    const cfpwd = form.getFieldValue('cfpwd');
    const oldval = form.getFieldValue('newpwd');
    const newval = val.target.value;
    if (cfpwd === oldval || cfpwd === newval) {
      setTimeout(() => {
        form.validateFields('cfpwd', { force: true }, () => {});
      }, 50);
    }
  }

  render() {
    const { visible, form } = this.props;
    const { getFieldDecorator } = form;

    return (
      <Modal visible={visible} onCancel={this.handleOnCancel} onOk={this.handleOnOk} title="修改密码" width="600px" okText="确定" cancelText="取消">
        <Form>
          <FormItem {...formItemLayout} label="当前密码" required={false}>
            {getFieldDecorator('oldpwd', {
              rules: [{
                required: true,
                message: '当前密码不能为空',
              }],
            })(
              <Input type="password" placeholder="请输入当前密码" />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="新密码" required={false}>
            {getFieldDecorator('newpwd', {
              rules: [{
                required: true,
                message: '新密码不能为空',
              }],
            })(
              <Input onChange={this.handleNewPasswdChange} type="password" placeholder="请输入新密码" />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="确认密码">
            {getFieldDecorator('cfpwd', {
              rules: [{
                validator: (rule, value, callback) => {
                  callback(form.getFieldValue('newpwd') === value ? undefined : '前后两次输入的密码不一致');
                },
              }],
            })(
              <Input type="password" placeholder="请再输入一遍新密码" />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
