import React, { Component } from "react";
import classNames from "classnames";
import { observer } from "mobx-react";

import { StoreNim, StoreChatroom, StoreNetcall, StoreWhiteBoard } from "store";
import { Storage } from "util";

import EXT_NIM from "ext/nim";
import EXT_CHAT from "ext/chatroom";
import EXT_NETCALL from "ext/webrtc";
import video from "../netcall/video";

const NimState = StoreNim.state;
const NimAction = StoreNim;
const ChatroomState = StoreChatroom.state;
const ChatroomAction = StoreChatroom;
const NetcallState = StoreNetcall.state;
const NetcallAction = StoreNetcall;

@observer
export default class extends Component {
  state = {
    isFullScreen: false
  };


  timmer = setInterval(() => {
    let custom = ChatroomState.custom;
    let self = this;
    if (custom.shareID !== "") {
      if (!NetcallState.videoIsFullScreen) {
        let index = NetcallAction.findMember({ account: custom.shareID })
        if (index != -1) {
          let dom = NetcallState.doms[index];
          if (dom) {
            let el = dom.parentElement.querySelector('.fullscreen-open')
            if (el) {

              //学生端分享屏幕 需要关闭全屏
              self.setState({
                isFullScreen:false
              });

              console.log('click了..........');
              el.click();
              console.log('isFullScreen',self.state.isFullScreen);
            }
          }
        }
      } else {
        // 开启了，需要确定是否开启了
        if (this.refs.myContainer) {
          if (this.refs.myContainer.childNodes.length === 0) {
            //没有子节点，可能没有渲染出来
            this.exitFullScreen();
          }
        }
      }
    }
  }, 300)

  componentWillUnmount() {
    clearInterval(this.timmer)
  }

  //退出大屏
  exitFullScreen = e => {
    NetcallAction.setVideoIsFullScreen(false);

    let shareID = ChatroomState.custom.shareID;
    const teacherAccount = Storage.get("teacherAccount");

    //默认窗口显示
    const index = NetcallAction.findMember({
      account: shareID
    });
    console.log("### 缩小", index, NetcallState.doms[index], shareID);
      console.info("20200221 student 69")
    EXT_NETCALL.startRemoteStream(shareID, NetcallState.doms[index]);
    EXT_NETCALL.setVideoViewRemoteSize(shareID);
    document.querySelectorAll('video').forEach(videoEle => {
      videoEle.play()
    })
  };

  render() {
    const { className, visible } = this.props;
    let html = '';
    if (NetcallState.videoIsFullScreen) {
      html = <div className={classNames(this.state.isFullScreen ? 'video-fullscreen-box' : 'video-fullscreen-box-no')}>
        {/* <div className="exit-fullscreen" onClick={this.exitFullScreen} /> */}
        <div className="video-fullscreen" onClick={this.toggleFullscreen.bind(this)} />
      </div>

    }
    return (
      <div className={classNames(
        "m-fullscreen-box",
        visible ? "" : "hide"
      )}>
        <div
          id="m-whiteboard-fullscreen"
          ref="myContainer"
          className={classNames(
            "m-whiteboard-container",
            className,
            visible ? "" : "hide",
            this.state.isFullScreen ? "m-whiteboard-video-fullscreen" : "m-whiteboard-video"
          )}
        >

        </div>
        {html}
      </div>
    );
  }
  /**
   * 显示全屏
   * @param {Object} element
   */
  toggleFullscreen(element) {
    var element = document.querySelector('#m-whiteboard-fullscreen video')
    if (!element) {
      return;
    }
    element.play()
    this.setState({
      isFullScreen: !this.state.isFullScreen
    })
  }
}
