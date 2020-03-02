
import React, { Component } from 'react';
import classNames from 'classnames';
import { observer } from "mobx-react";

import { StoreNim, StoreChatroom, StoreNetcall, StoreWhiteBoard } from "store";
import EXT_NETCALL from 'ext/webrtc'
const NimState = StoreNim.state;
const NimAction = StoreNim;
const ChatroomState = StoreChatroom.state;
const ChatroomAction = StoreChatroom;
const NetcallState = StoreNetcall.state;
const NetcallAction = StoreNetcall;
import { Storage } from "util";

@observer
export default class extends Component {
  state = {
    isFullScreen: false
  };
  componentWillUnmount() {
    clearInterval(this.timmer)
  }

  componentWillReceiveProps(nextProps){//父组件控制教师端共享屏幕 全屏
    this.setState({
      isFullScreen: nextProps.isTeacherFullScreen
    })
  }

  timmer = setInterval(() => {
    // 初始化
    let shareID = ChatroomState.custom.shareID
    const findIdx = NetcallState.members.findIndex(item => {
      return item.account == shareID
    })
    if (!this.srcObject && shareID !== "" && this.shareID != shareID) {
      if (findIdx == -1) {
        console.warn('不存在的成员, 无法渲染', shareID)
      } else {
        const dom = NetcallState.doms[findIdx]
        if (!dom) {
          console.warn('@@@@ 不存在的节点，忽略渲染本地流')
        } else {
          console.log('teacher:timmer当前人员加入节点：', dom)
          let userSmallVideo = dom.querySelector('video');
          let videoShareNode = document.getElementById('videoShare')
          if (videoShareNode && userSmallVideo) {
            this.shareID = shareID;
            videoShareNode.srcObject = this.srcObject = userSmallVideo.srcObject
            videoShareNode.play()

            if (shareID !== NetcallState.account) {
              EXT_NETCALL.stopRemoteStream(shareID);
                console.info("20200221 teacher 49")
              EXT_NETCALL.startRemoteStream(shareID, videoShareNode);
              // EXT_NETCALL.setVideoViewRemoteSize(shareID, 700, 490);
              // document.querySelectorAll('video').forEach(videoEle => {
              //   videoEle.play()
              // })
            }
          }
        }
      }
    }

    // 还原
    if (this.srcObject && shareID == "") {
      const index = NetcallAction.findMember({
        account: this.shareID
      });
      if (index !== -1) {
        if (this.shareID !== NetcallState.account) {
          // EXT_NETCALL.startRemoteStream(this.shareID, NetcallState.doms[index]);
          // EXT_NETCALL.setVideoViewRemoteSize(this.shareID);
          // document.querySelectorAll('video').forEach(videoEle => {
          //   videoEle.play()
          // })
        }
      }
      this.srcObject = null;
      this.shareID = null;
    }

    // 有变更
    if (this.srcObject && findIdx !== -1) {
      const dom = NetcallState.doms[findIdx]
      if (dom) {
        let userSmallVideo = dom.querySelector('video');
        let videoShareNode = document.getElementById('videoShare')
        if (videoShareNode && userSmallVideo) {
          if (userSmallVideo.srcObject !== this.srcObject) {
            console.warn('src object is different')
              console.info("20200221 teacher 88")
            EXT_NETCALL.startRemoteStream(this.shareID, videoShareNode);
            this.srcObject = userSmallVideo.srcObject;
            videoShareNode.srcObject = this.srcObject = userSmallVideo.srcObject
            videoShareNode.play()
          }
        }
      }
    }
  }, 300)

  render() {
    const { visible, } = this.props;


    const ua = window.navigator.userAgent;
    const isChrome = ua.indexOf("Chrome") && window.chrome;
    let shareText = '';
    let shareID = ChatroomState.custom.shareID;
    let showSwitchVideo = shareID === Storage.get('account');

    if (isChrome) {
      if (NetcallState.chromeDown) {
        shareText = <div className="video-share-container">
          <p className="share-text">检测到您还没有安装屏幕共享插件，请先下载插件，安装完成之后<a href="javascript:;" onClick={this.reload}>刷新</a>页面，体验屏幕共享功能。</p>
          <a className="share-plug" href="https://app.yunxin.163.com/webdemo/3rd/chrome/yunxin-Web-Screensharing.crx">下载Chrome插件</a>
          <p className="share-text2">提示：下载完插件，请先参考<a href="http://dev.netease.im/docs/product/%E9%80%9A%E7%94%A8/Demo%E6%BA%90%E7%A0%81%E5%AF%BC%E8%AF%BB/%E5%9C%A8%E7%BA%BF%E6%95%99%E8%82%B2Demo/Web%E6%BA%90%E7%A0%81%E5%AF%BC%E8%AF%BB?#Chrome%E5%B1%8F%E5%B9%95%E5%85%B1%E4%BA%AB%E6%8F%92%E4%BB%B6%E5%AE%89%E8%A3%85" target="_blank">Chrome屏幕共享插件安装教程</a>，再安装插件</p>
        </div>
      } else {

        shareText = <div className="video-share-container">
          <video id="videoShare" className={classNames("video-share", this.state.isFullScreen ? 'fullscreen-teacher' : '')} width="100%" />
          <div className={classNames(this.state.isFullScreen ? 'video-fullscreen-box' : 'video-fullscreen-box-no')}>
            <span className={classNames(this.state.isFullScreen ? 'exit-fullscreen' : 'video-fullscreen')} onClick={this.fullScreen.bind(this, 'videoShare')}></span>
          </div>
          {showSwitchVideo &&
          <div className="change-video u-btn u-btn u-btn-smaller" onClick={this.props.shareScreen}>
            切换
          </div>}
        </div>
      }
    } else {
      shareText = <div className="share-text">该浏览器下暂不支持屏幕共享，请在Chrome浏览器下打开Web端教育demo，使用屏幕共享功能。若未下载Chrome浏览器，请先<a href="javascript:;" onClick={this.downChrome}>下载Chrome浏览器</a>。</div >
    }
    return (
      <div className={classNames("m-whiteboard-container", visible ? '' : 'hide')}>
        {shareText}
      </div>
    );
  }
  /**
   *重新加载页面
   *
   */
  reload() {
    window.location.reload()
  }
  /**
   *下载chrome
   *
   */
  downChrome() {
    window.open("https://www.baidu.com/s?wd=chrome");
  }
  /**
   *全屏
   */
  fullScreen(id) {
//    debugger
    this.setState({
      isFullScreen: !this.state.isFullScreen
    })
  }
  /**
   *屏幕共享
   */

}
