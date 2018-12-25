import React, { PureComponent } from 'react';
import Fileitem from './fileitem';

export default class filebar extends PureComponent {
  render() {
    const { fileList, onFileClose } = this.props;
    return (
      <div className="ant-upload-list ant-upload-list-text">
        {fileList.map(el => <Fileitem onFileClose={onFileClose} key={el.uid} item={el} />)}
      </div>
    );
  }
}

