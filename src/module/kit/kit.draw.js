/*
 * @Author: lduoduo 
 * @Date: 2018-01-27 13:20:12 
 * @Last Modified by: lduoduo
 * @Last Modified time: 2018-02-05 20:33:13
 * 白板工具栏组件: 左侧更多功能的工具栏
 */

import React, { Component } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react';

import { Row, Col, Icon } from 'component';

import { StoreWhiteBoard } from 'store';

const ActionWB = StoreWhiteBoard;
const StoreWB = StoreWhiteBoard.state;

@observer
export default class extends Component {
  styleClick = item => {
    ActionWB.setStyle(item);
  };
  render() {
    return (
      <Row id="tool-bar-wb" className="m-kit m-kit-draw flex-v">
      </Row>
    );
  }
}
