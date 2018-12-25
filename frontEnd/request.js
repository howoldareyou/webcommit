// https://github.com/axios/axios

import axios from 'axios';
import React from 'react';
import { stringify } from 'qs';

import { notification } from 'antd';
import cookies from 'browser-cookies';

const { CancelToken } = axios;

export default function request(options = {}) {
  if (!options.url) return;

  const source = CancelToken.source();

  const opt = {
    url: options.url,
    method: options.method || 'GET',
    headers: options.headers || {},
    cancelToken: source.token,
  };

  if (options.data) {
    if (opt.method === 'GET') {
      opt.url += `?${stringify(options.data)}`;
    } else {
      opt.data = stringify(options.data);
      opt.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
  }

  opt.headers['x-csrf-token'] = cookies.get('csrfToken');

  axios(opt).then((response) => {
    const { data } = response;
    if (data.success === true) {
      if (options.fnOk) options.fnOk(data.data);
    } else {
      const message = data.message || '系统出错';
      notification.error({
        message: '操作失败',
        description: <div dangerouslySetInnerHTML={{ __html: message }} />, // eslint-disable-line
      });
      if (options.fnErr) options.fnErr();
    }
  }).catch((e) => {
    if (axios.isCancel(e)) return false;
    const { status = 404 } = e.response || {};
    notification.error({
      message: '请求失败', // `请求失败 ${status}: ${e.config.url}`,
      description: `返回码 ${status}`, // errortext,
    });

    if (options.fnErr) options.fnErr();
  });

  return source.cancel;
}
