import React, { PureComponent } from 'react';
import { Modal } from 'antd';
import Draggable from 'react-draggable';
import classNames from 'classnames';
import styles from './index.less';

export default class MyModal extends PureComponent {
  constructor(props) {
    super(props);

    const {
      left = 0,
      top = 100,
    } = props;

    this.state = {
      left,
      top,
    };
  }

  handleDragStart = () => {
    const { left, top } = this.state;
    this.startLeft = left;
    this.startTop = top;
    this.hasDrag = false;
  }

  handleDrag = (e, n) => {
    if (!this.hasDrag) {
      this.mouseX = e.pageX - n.x;
      this.mouseY = e.pageY - n.y;
      this.hasDrag = true;
    }
    const left = this.startLeft + (e.pageX - this.mouseX);
    const top = Math.max(this.startTop + (e.pageY - this.mouseY), 0);

    this.setState({
      left,
      top,
    });
  }

  render() {
    const { left, top } = this.state;
    const {
      children,
      className,
      ...otherProps
    } = this.props;

    return (
      <Draggable
        position={{ x: 0, y: 0 }}
        handle=".ant-modal-header"
        onStart={this.handleDragStart}
        onDrag={this.handleDrag}
      >
        <div style={{ display: 'none' }}>
          <Modal
            className={classNames(className, styles.DragModal)}
            style={{ left, top }}
            {...otherProps}
          >
            {children}
          </Modal>
        </div>
      </Draggable>
    );
  }
}
