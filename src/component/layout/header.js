import React, { Component } from "react";
import classNames from "classnames";
import { Button } from "component";

import { observer } from "mobx-react";

import { StoreNim, StoreChatroom, StoreNetcall } from "store";

import EXT_NIM from "ext/nim";
import EXT_CHAT from "ext/chatroom";
import EXT_NETCALL from "ext/webrtc";
import EXT_WHITEBOARD from "ext/whiteboard";

import { Storage, Alert } from "util";

const NimState = StoreNim.state;
const NimAction = StoreNim;
const ChatroomState = StoreChatroom.state;
const ChatroomAction = StoreChatroom;
const NetcallState = StoreNetcall.state;
const NetcallAction = StoreNetcall;

@observer
export default class extends Component {

  componentDidMount() {
    // 刷新 关闭 当前窗口 提示 关闭信息
    // let bCloseFlag=false;//关闭窗口标志位
    // 备注： 执行了 beforeunload 事件 用户点击离开还是取消 摄像头都会变成离线状态，
    // 所以直接把退出聊天室的逻辑写在这个事件下，不需要onunload 事件了
    // 刷新的时候不触发，只有关闭的时候才可以触发离开聊天室的操作
    // let _this = this;
    // let bRefreshFlag = false;

    // F5 和 CTRL+R 刷新 不执行退出聊天室方法
    // document.onkeydown = function (e) {
    //   var ev = window.event || e;
    //   var code = ev.keyCode || ev.which;
    //   if (code == 116) {// 页面F5刷新
    //     bRefreshFlag = true;
    //   }
    //   else if (event.ctrlKey && code == 82) {  // 禁用 ctrl+R 刷新
    //     bRefreshFlag = true;
    //     return false;
    //   }
    // }




    // window.addEventListener("beforeunload",function (e) {
    //   // e = e || window.event;
    //   // bCloseFlag = true;
    //   // e.returnValue = '关闭提示';
    //   // 写入离开页面之后的代码逻辑
    //   if (!bRefreshFlag) {
    //     EXT_CHAT.close(ChatroomState.currChatroomId, false)
    //       .then(() => {
    //         console.log("关闭聊天室成功，继续退出流程");
    //         _this.doLogoutChatroom();
    //       })
    //       .catch(error => {
    //         console.log("关闭聊天室失败: ", error);
    //       });
    //     e.returnValue = 'aaaaa';
    //   }
    // });

    // 确定离开页面 开始聊天的退出流程
    // window.onunload = function(){
    //   if (bCloseFlag) {
    //     debugger
    //     // 写入离开页面之后的代码逻辑
    //     EXT_CHAT.close(ChatroomState.currChatroomId, false)
    //       .then(() => {
    //         // debugger
    //         console.log("关闭聊天室成功，继续退出流程");
    //         this.doLogoutChatroom();
    //       })
    //       .catch(error => {
    //         console.log("关闭聊天室失败: ", error);
    //       });
    //   }
    //   return "你确定要离开吗"
    // }
  }

  //退出点击响应
  logout = () => {
    console.log("退出im....");
    Alert.open({
      title: "操作确认",
      msg:
        '<div class="u-logoutim"><i class="u-icon-tip"></i> 确认要退出吗？</div>',
      isHtml: true,
      btns: [
        {
          label: "退出",
          clsName: "u-btn-smaller f-mgr-10 ",
          onClick: () => {
            console.log("【退出IM弹窗】 --> 确认");
            this.doLogoutIM();
          }
        },
        {
          label: "取消",
          clsName: "u-btn-cancle",
          onClick: () => {
            console.log("【退出IM弹窗】 --> 取消");
            Alert.close();
          }
        }
      ]
    });
  };

  doLogoutIM = () => {
    Alert.close();
    EXT_NIM.logout();
  };

  doLogoutChatroom = () => {
    EXT_CHAT.logout(ChatroomState.currChatroomId);
  };

  //老师退出会议
  doClose4Teacher = () => {
    console.log("老师：结束会议...");
    Alert.close();
    EXT_CHAT.close(ChatroomState.currChatroomId)
      .then(() => {
        // debugger
          Storage.remove("nickname");
          Storage.remove("username");
          Storage.remove("pwd");
          Storage.remove("roomName");
          Storage.remove("roomType");
        console.log("关闭聊天室成功，继续退出流程");
        this.doLogoutChatroom();
      })
      .catch(error => {
        console.log("关闭聊天室失败: ", error);
      });
  };

  //学生退出房间
  doClose4Student = () => {
    console.log("学生：退出房间...");
      Storage.remove("nickname");
      Storage.remove("username");
      Storage.remove("pwd");
      Storage.remove("roomName");
      Storage.remove("roomType");
    Alert.close();
    this.doLogoutChatroom();
  };
  doCancle = () => {
    console.log("【关闭确认弹窗】 -> 取消...");
    Alert.close();
  };

  closeChatroom = () => {
    const type = ChatroomState.type;
    const isTeacher = type == "owner";
    const msg =
      '<div class="u-exitroom">' +
      (isTeacher
        ? '<i class="u-icon-tip"></i> 确认要结束远程音视频互动? '
        : '<i class="u-icon-tip"></i> 确认要退出远程音视频互动?') +
      "</div>";
    const btns = [
      {
        clsName: "u-btn-smaller f-mgr-10"
      },
      {
        label: "取消",
        clsName: "u-btn-cancle",
        onClick: () => {
          this.doCancle();
        }
      }
    ];

    if (isTeacher) {
      btns[0].label = "确定";
      btns[0].onClick = () => {
        this.doClose4Teacher();
      };
    } else {
      btns[0].label = "退出";
      btns[0].onClick = () => {
        this.doClose4Student();
      };
    }

    //显示弹窗
    Alert.open({
      title: "提示",
      msg: msg,
      isHtml: true,
      btns: btns
    });
  };

  render() {
    const { isHome } = this.props;
    return (
      <div className="m-header">
        <div className="logo">
        </div>
        <div className="logo-title">
          {"人民好医生云会诊平台"}
          </div>
        <div className="opt">
          {/*{NimState.account}*/}
          <div className="opt-inner">
            {isHome ? (
              <a
                href="javascript:void(0);"
                className="logout"
                onClick={this.logout}
              >
                退出
              </a>
            ) : (
              <a
                href="javascript:void(0);"
                onClick={this.closeChatroom}
              >
              <Button
                  className="u-btn-longer-exit"
              >
                      关闭远程音视频互动
                  </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }
}
