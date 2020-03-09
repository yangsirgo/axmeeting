/*
 * @Author: lduoduo
 * @Date: 2018-01-26 16:32:42
 * @Last Modified by: andyzou
 * @Last Modified time: 2019-03-21 17:16:20
 * 白板区域
 */

import React, { Component } from "react";
import classNames from "classnames";
import { observer } from "mobx-react";

import WB from "./wb";
import ScreenShare4Teacher from "./screen.teacher";
import ScreenShare4Student from "./screen.student";

import { Storage } from "util";

import { StoreNim, StoreChatroom, StoreNetcall, StoreWhiteBoard } from "store";
import EXT_NETCALL from 'ext/webrtc'
import EXT_NIM from "ext/nim"

const NimState = StoreNim.state;
const NimAction = StoreNim;
const ChatroomState = StoreChatroom.state;
const ChatroomAction = StoreChatroom;
const NetcallState = StoreNetcall.state;
const NetcallAction = StoreNetcall;

@observer
export default class extends Component {
  state = {
    tabIndex: 0,
    isTeacherFullScreen:false //教师端共享屏幕 全屏控制
  }

  showWhiteboardPanel = e => {
    // webrtc未初始化完成或者 自己在屏幕共享中 return
    if (!(NetcallState.webrtc && NetcallState.webrtc.startDevice)) {
      return
    }

    // this.switchMaskShare();
    const isTeacher = Storage.get('isTeacher')
    if (isTeacher == 1) {
      NetcallAction.settabindex(0)
      NetcallAction.setShareStarted(false)
      this.startCamera()
      if (ChatroomState.custom) {

        let custom = { ...ChatroomState.custom }
        Object.assign(custom, {
          fullScreenType: 0,// 已经无用了 标记屏幕共享状态 共享
          showType: 1,
          shareID: ""
        })
        EXT_NIM.updateChatroom(custom)
      }
    }
      setTimeout(() => {
          StoreWhiteBoard.setStatus({maskShareState: false});
          console.log("20200306 StoreWhiteBoard.state.maskShareState", StoreWhiteBoard.state.maskShareState);
      }, 1000)
  }

  showScreenSharePanel = e => {
    // webrtc未初始化完成或者屏幕共享已点击 return
    if (!(NetcallState.webrtc && NetcallState.webrtc.startDevice)) {
      return
    }
    NetcallAction.settabindex(1)
    this.shareScreen()
  }
  startCamera() {
    if (NetcallState.hasVideo && NetcallState.video) {
      //启用新设备并渲染画面
      EXT_NETCALL.startCamera()
        .then(() => {
          const findIdx = NetcallState.members.findIndex(item => {
            return item.account == NimState.account
          })
          if (findIdx == -1) {
            console.error('不存在的成员, 无法渲染', NimState.account)
            return
          }

          const dom = NetcallState.doms[findIdx]
          if (!dom) {
            console.error('@@@@ 不存在的节点，忽略渲染本地流')
            return
          }
          console.log('其他【摄像头】设备自动开启成功：')
          EXT_NETCALL.startLocalStream(dom)
          EXT_NETCALL.setVideoViewSize(1)
        })
        .catch(error => {
          console.error('其他【摄像头】设备自动开启失败：', error)

          //禁用状态识别
          //chrome
          if (error == 'NotAllowedError') {
            NetcallAction.setHasVideo(false)
          }
        })
    } else {
      // 延时处理 否则对端视频可能未关闭
      setTimeout(() => {
        EXT_NETCALL.stopCamera()
          .then(() => {
            console.log("==本地摄像头关闭成功");
            const findIdx = NetcallState.members.findIndex(item => {
              return item.account == NimState.account
            })
            if (findIdx == -1) {
              console.error('不存在的成员, 无法渲染', NimState.account)
              return
            }
            const dom = NetcallState.doms[findIdx]
            if (!dom) {
              console.error('@@@@ 不存在的节点，忽略渲染本地流')
              return
            }
            EXT_NETCALL.stopLocalStream(dom);
          })
          .catch(error => {
            console.error("==本地摄像头关闭失败", error);
          });
      }, 100);

    }
  };
  /**
   *屏幕共享
   */
  shareScreen = () => {
    const ua = window.navigator.userAgent;
    const isChrome = ua.indexOf("Chrome") && window.chrome;
    if (!isChrome) {
      return
    }
    const currentAccount = Storage.get('account') ;
    const isTeacher = Storage.get('isTeacher') == 1;
    const shareID = ChatroomState.custom.shareID;
    console.log(isTeacher ,shareID, currentAccount)

    this.setState({//教师端共享屏幕 关闭全屏
      isTeacherFullScreen:false
    });

    if (shareID === "" || (isTeacher && shareID == currentAccount)) {
      NetcallAction.setHasShareScreen(true);
      NetcallAction.setVideoIsFullScreen(true);
      NetcallAction.setChromeDown(false)
      EXT_NETCALL.startChromeShareScreen()
        .then(() => {
          console.log('===屏幕共享启动成功');
          this.switchMaskShare(true);
          NetcallAction.setHasShareScreen(false);
          if (ChatroomState.custom) {
            ChatroomAction.mergeCustom({
              fullScreenType: 1,// 已经无用了 标记屏幕共享状态 共享
              showType: 0,
              shareID: NimState.account
            })
            // ChatroomState.custom.fullScreenType = 1 // 已经无用了 标记屏幕共享状态 共享
            // ChatroomState.custom.showType = 0;
            // ChatroomState.custom.shareID = Storage.get('account');
            console.log('当前Custom', ChatroomState.custom)
            ChatroomAction.setCustom(ChatroomState.custom)
            EXT_NIM.updateChatroom(ChatroomState.custom)
          }
          const findIdx = NetcallState.members.findIndex(item => {
            return item.account == NimState.account
          })
          if (findIdx == -1) {
            console.error('不存在的成员, 无法渲染', NimState.account)
            return
          }

          const dom = NetcallState.doms[findIdx]
          if (!dom) {
            console.error('@@@@ 不存在的节点，忽略渲染本地流')
            return
          }
          console.log('module:whiteboard:当前人员加入节点：', dom)
          EXT_NETCALL.startLocalStream(dom)
          EXT_NETCALL.setVideoViewSize()
          NetcallAction.setShareStarted(true)
          setTimeout(() => {
            console.log('”“”“”“@@@@')
            // let dom1 = document.getElementById('videoShare')
            // dom1.srcObject = dom.childNodes[0].childNodes[0].srcObject
            // dom1.play()
          }, 1000)
        })
        .catch(error => {
          console.error('屏幕共享启动失败', error)
          NetcallAction.setHasShareScreen(false);
          if (error && error.code === 62008) {
            NetcallAction.setChromeDown(true)
            NetcallAction.setShareStarted(false)
          } else {
            // 拉流失败到白板页面
            this.showWhiteboardPanel()
          }

        })
      EXT_NETCALL.changeRoleToPlayer()
    }
  };

    stopStudentScreenSharing = () => {
        const findIdx = ChatroomState.members.findIndex((item, index) => {
            return item.type == "owner";
        });
        if (findIdx == -1) {
            console.error("未找到老师端，老师不在线所致");
            return;
        }
        const account = ChatroomState.members[findIdx].account;
        console.log("当前聊天室主持人：", account);
        EXT_NIM.sendCustomSysMsg(account, {
            room_id: ChatroomState.currChatroomId,
            command: 15
        });
        let selfIndex = NetcallState.members.findIndex(item => {
            return item.account == NimState.account;
        });
        NetcallAction.settabindex(0);
        NetcallAction.setShareStarted(false);
        EXT_NETCALL.startCamera().then(() => {
            EXT_NETCALL.setVideoViewSize(0);
            EXT_NETCALL.startLocalStream(NetcallState.doms[selfIndex] );
        });
        this.switchMaskShare(false);
    };
    switchMaskShare(flag){
        // this.setState({maskShareState: StoreWhiteBoard.state.maskShareState});
        StoreWhiteBoard.setStatus({maskShareState: flag})
        console.log("20200306 StoreWhiteBoard.state.maskShareState", StoreWhiteBoard.state.maskShareState);
    }
  render() {
    let isTeacher = Storage.get('isTeacher')
    isTeacher = isTeacher == 1;
    const { children, className } = this.props
    const state = this.state
    // 学生端屏幕共享有文案变更
    let text = (NetcallState.videoIsFullScreen && !isTeacher) ? '屏幕共享' : ''

    let custom = ChatroomState.custom;
    const someOneIsSharing = custom.shareID !== "" && custom.showType == 0;
    let member = NetcallState.members.find(member => member.account == Storage.get('account'))
    let shareVideoText;
    if (custom.showType == 0 && custom.shareID === "") {
      shareVideoText = "视频"
    };
    if (custom.showType == 0 && custom.shareID !== "") {
      shareVideoText = "屏幕共享"
    };


    let activeWhiteBoard = NetcallState.tabIndex == 0 && custom.showType == 1;

    const maskShareStyle={
        display: StoreWhiteBoard.state.maskShareState ? 'block' : 'none'
    };
    return (
      <div className="m-whiteboard">
        <div className="u-tab">
          <div className="u-tab-header u-tab-header-big">
            <div
              className={classNames(
                'u-tab-item u-tab-item-big',
                activeWhiteBoard ? 'active' : ''
              )}
              onClick={this.showWhiteboardPanel}
            >
              {'白板'}
            </div>
            {someOneIsSharing &&
              <div className={classNames(
                'u-tab-item u-tab-item-big', 'active'
              )} >{shareVideoText} </div>}
            {isTeacher && !someOneIsSharing && (
              <div
                className={classNames(
                  'u-tab-item u-tab-item-big',
                  NetcallState.tabIndex == 1 ? 'active' : ''
                )}
                onClick={this.showScreenSharePanel}
              >
                屏幕共享
              </div>
            )}
          </div>
          <div className="u-tab-body">
                <div className="mask-share" style={maskShareStyle}>
                共享中
                {
                    isTeacher ? (<a onClick = {this.showWhiteboardPanel}> 关闭共享 < /a>) :
                (<a onClick = {this.stopStudentScreenSharing}> 学生关闭共享 < /a>)
                }
                </div>
            <WB visible={NetcallState.tabIndex == 0 && !someOneIsSharing} />
            {isTeacher ? (
              <ScreenShare4Teacher
                isTeacherFullScreen={this.state.isTeacherFullScreen}
                shareScreen={this.shareScreen}
                visible={NetcallState.tabIndex == 1 || someOneIsSharing}
              />
            ) : (
                <ScreenShare4Student
                  className="m-whiteboard-video m-whiteboard-container-cover"
                  visible={NetcallState.videoIsFullScreen}
                />
              )}
          </div>
        </div>
      </div>
    )
  }
}
