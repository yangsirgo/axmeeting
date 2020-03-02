/*
 * @Author: lduoduo 
 * @Date: 2018-01-27 13:20:12 
 * @Last Modified by: lduoduo
 * @Last Modified time: 2018-03-26 22:10:29
 * 白板工具栏组件: 底部最基本的工具栏
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';

import classNames from 'classnames';

import { Row, div, Tooltip, Pagination } from 'component';
import ColorKit from './kit.color';

import EXT_WHITEBOARD from 'ext/whiteboard';

import { StoreWhiteBoard, StoreNetcall, StoreChatroom } from 'store';

const NetcallState = StoreNetcall.state;
const ChatroomState = StoreChatroom.state;
const WhiteBoardState = StoreWhiteBoard.state;

@observer
export default class extends Component {
  constructor(props) {
    super(props)
    this.mustMountUI()
  }
  mustMountUI() {
    // 这里逻辑挺乱的，其实就是当组件挂载的时候就
    clearInterval(this.timmer)
    this.timmer = setInterval(() => {
      if (DrawPluginUI.getEl() && !DrawPluginUI.appEl) {
        try {
          const [appEl, app] = DrawPluginUI.mount(
            DrawPluginUI.getEl(),
            DrawPluginUI.account,
            DrawPluginUI.handler,
            DrawPluginUI.options,
            DrawPluginUI.appEl
          )
          DrawPluginUI.appEl = appEl;
          DrawPluginUI.app = app;

          clearInterval(this.timmer);
          this.timmer = null;
        } catch (e) {
          console.error(e)
        }
      }
    }, 20)

  }
  mustUnmountUI() {
    console.warn('component will unmount ui');
    clearInterval(this.timmer)
    this.timmer = null;
    try {
      let appEl = DrawPluginUI.appEl;
      let dom = DrawPluginUI.getEl();
      if (dom && DrawPluginUI.appEl) {
        DrawPluginUI.unmount(dom, appEl)
      }
      DrawPluginUI.appEl = undefined
    } catch (e) {
      console.error(e)
    }


  }
  setDrawModeFlag() {
    EXT_WHITEBOARD.setDrawModeFlag();
  }
  setDrawModeFree() {
    EXT_WHITEBOARD.setDrawModeFree();
  }
  undo() {
    EXT_WHITEBOARD.undo();
  }
  clear() {
    EXT_WHITEBOARD.clear();
  }
  openFileKit() {
    StoreWhiteBoard.setFileKitEnable(true);
  }
  resetFileKit() {
    StoreWhiteBoard.setFileKitEnable(false);
    EXT_WHITEBOARD.clearFile();
    EXT_WHITEBOARD.setDrawModeFree();
  }
  onPageChange(index) {
    console.log('onPageChange', index);
    EXT_WHITEBOARD.clear();
    EXT_WHITEBOARD.setImage(index);
  }

  componentWillUnmount() {
    this.mustUnmountUI()
  }

  render() {
    if (this.prevPermission !== NetcallState.hasPermission) {
      this.prevPermission = NetcallState.hasPermission;

      //
      if (this.timmer !== null) {
        // 说明初始化的时间还没有走完 所以我们不需要做任何事情
      } else {
        // 说明初始化的第一次挂载已经挂载了，需要启用下面的手动挂载和卸载操作
        if (NetcallState.hasPermission) {
          // 如果有权限，就会
          this.mustMountUI()
        }else{
          this.mustUnmountUI()
        }
      }

    }


    return (
      NetcallState.hasPermission && (
        <Row id={'js-wb-toolbar'} className="m-kit m-kit-wb"> </Row>
      )
    );
  }
}
