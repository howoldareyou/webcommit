import React, { PureComponent } from 'react';
import { Form, Input, Button, message } from 'antd';

import request from './request';

const FormItem = Form.Item;
const { TextArea } = Input;

const formItemLayout = {
  labelCol: { span: 0 },
  wrapperCol: { span: 24 },
};

function getCacheFileName(el) {
  try {
    return el.response.data.fileId;
  } catch (e) {
    return null;
  }
}

function encodeFiles(list) {
  const str = JSON.stringify(list);
  const arr = [];
  for (let i = str.length - 1; i >= 0; i -= 1) {
    arr.push((str.charCodeAt(i) + i + 66).toString(16).replace(/f/g, 'g'));
  }
  return arr.join('f');
}

@Form.create()
export default class comfirmModal extends PureComponent {
  state = {
    loading: false,
  }

  handleOnSubmit = (e) => {
    e.preventDefault();
    const { form, getFiles } = this.props;
    form.validateFields({ force: true }, (err, values) => {
      if (err) return;
      const fileList = getFiles();
      if (!this.handleCheckFiles(fileList)) return;
      const files = fileList.map(el => ([el.name, getCacheFileName(el)]));
      this.setState({ loading: true });
      request({
        url: '/commit',
        method: 'POST',
        data: {
          files: encodeFiles(files),
          message: values.message,
        },
        fnOk: this.handleOnOk,
        fnErr: () => { this.setState({ loading: false }); },
      });
    });
  }

  handleCheckFiles = (fileList) => {
    if (!fileList) return false;

    if (fileList.some(el => el.percent < 100)) {
      message.error('文件还没上传完成，请结束后再试...');
      return false;
    }

    const cacheFiles = fileList.map(getCacheFileName);
    if (cacheFiles.some(el => !el)) {
      message.error('存在上传失败文件，请确认后再试...');
      return false;
    }

    return true;
  }

  handleOnOk = () => {
    const { onOk, form } = this.props;
    message.success('提交成功');
    this.setState({ loading: false });
    form.setFieldsValue({ message: '' });
    onOk();
  }

  handleOnCancel = () => {
    const { onCancel } = this.props;
    onCancel();
  }


  render() {
    const { form } = this.props;
    const { loading } = this.state;
    const { getFieldDecorator } = form;

    return (
      <Form onSubmit={this.handleOnSubmit}>
        <FormItem style={{ marginBottom: 10 }} {...formItemLayout}>
          {getFieldDecorator('message', {
            rules: [{
              required: true,
              max: 64,
              message: '必须填写消息，并且长度不能超过64个字符',

            }],
          })(
            <TextArea rows={6} autoComplete="off" placeholder="请输入消息, 最多可输入64个字符" />
          )}
        </FormItem>
        <FormItem>
          <Button loading={loading} type="primary" htmlType="submit">提交</Button>
        </FormItem>
      </Form>
    );
  }
}
