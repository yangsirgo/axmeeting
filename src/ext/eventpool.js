import EXT_NIM from "ext/nim";
import EXT_CHAT from "ext/chatroom";
import EXT_NETCALL from "ext/webrtc";
import EXT_WHITEBOARD from "ext/whiteboard";
import EXT_EVENTPOOL from "ext/eventpool";

import { StoreNim, StoreNetcall, StoreChatroom, StoreEventPool } from "store";
import { Storage } from "util";

const NimState = StoreNim.state;
const NimAction = StoreNim;
const ChatroomState = StoreChatroom.state;
const ChatroomAction = StoreChatroom;
const NetcallState = StoreNetcall.state;
const NetcallAction = StoreNetcall;
const EventPoolAction = StoreEventPool;
const EventPoolState = StoreEventPool.state;

/**
 * 公用流程处理器，将多端流程线性统一
 */
export default {
  /**
   * 将RTC房间的权限控制（聊天室或点对点消息+WEBRTC事件归一）
   */
  handleRtcPermissionAndDraw(account, targetIndex = undefined) {
    console.log("******* handleRtcPermissionAndDraw(权限与绘制归一处理器) ********* ");

    console.log(account, targetIndex);

    // if (this.findRtcUserIndex(account) == -1) {
    //   console.warn("#### 等待对应账号的有权限的点对点消息通知，尚未进入房间...", account);
    //   return;
    // }
    if (!EventPoolState.remoteTrackNotifications[account]) {
      console.warn("### 等待首次远程轨道通知，尚未收到remoteTrack...", account);
      return;
    }

    const shareID = ChatroomState.custom.shareID;
    const teacherAccount = Storage.get("teacherAccount");
    if (
      shareID == account &&
      NetcallState.remoteIsScreenSharing //&&
      // NetcallState.videoIsFullScreen
    ) {
      //如果是老师且在屏幕共享状态下切换显示中
      console.log('render remote is screen sharing')
      this.renderRemoteRemoteIsScreenSharing(account);
    } else {
      //渲染远程画面到节点
      this.renderRemoteVideo(account, targetIndex);
    }
  },

  /**
   * 渲染远端指定账号的画面到对应DOM
   */
  renderRemoteVideo(account, targetIndex = undefined) {
    let index =
      targetIndex == undefined ? this.findRtcUserIndex(account) : targetIndex;
    // if (index == -1) {
    //   console.error("---------- 未找到的互动成员：", account);
    //   return;
    // }
    if (index == -1) {
      for (let i = 0; i < NetcallState.members.length; i++) {
        if (NetcallState.members[i].account.length === 0) {
          index = i
          break
        }
      }
    }
    console.log(JSON.stringify(NetcallState.members), index, NetcallState.members[index])
    console.log(JSON.stringify(ChatroomState.members), index, NetcallState.members[index])
    let chatMemberIndex = ChatroomAction.findMember({ account: account })
    if (chatMemberIndex !== -1) {
      let member = ChatroomState.members[chatMemberIndex];
      if (member && member.status == 1 || member.type === 'owner') {
        console.log("*** 设置远程视频画面：", account, NetcallState.doms[index]);
        EXT_NETCALL.stopRemoteStream(account, NetcallState.doms[index]);
        // console.info("2020-02-17:NetcallState.",JSON.stringify(NetcallState));
          console.info("20200221 eventpool 83")
        EXT_NETCALL.startRemoteStream(account, NetcallState.doms[index]);
          let width = 139;
          let height = 104;
          if(NetcallState.members[0].account == account){
              width = 280;
              height = 208;
          }
        // EXT_NETCALL.setVideoViewRemoteSize(account);
        EXT_NETCALL.setVideoViewRemoteSize(account, width, height);
      }
    } else {
      console.warn('no chat members')
    }
  },

  /**
   * 老师如果在屏幕共享中，则渲染放大显示
   * @param {String} account 账号
   */
  renderRemoteRemoteIsScreenSharing(account) {
    const dom = document.getElementById("m-whiteboard-fullscreen");
      console.info("20200221 eventpool 105")
    EXT_NETCALL.startRemoteStream(account, dom);
    EXT_NETCALL.setVideoViewRemoteSize(account, 700, 490);
  },

  /**
   * 查找指定账号是否在RTC房间中
   */
  findRtcUserIndex(account) {
    const index = NetcallAction.findMember({
      account: account
    });
    return index;
  }
};
