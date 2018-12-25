import '@babel/polyfill';
import 'raf/polyfill';
import React from 'react';
import ReactDOM from 'react-dom';

import '../src/index.less';
// import Report from './reportPreview';
import WebCommit from './WebCommit';

Object.setPrototypeOf = require('setprototypeof');

window.onload = () => {
  ReactDOM.render(
    <WebCommit />,
    document.getElementById('root')
  );
};
