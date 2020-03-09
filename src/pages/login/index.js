/*
 * @Author: lduoduo
 * @Date: 2018-01-24 16:06:27
 * @Last Modified by: andyzou
 * @Last Modified time: 2018-08-30 17:28:33
 * 登录页面
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';

import { Button, Row, Col, Input,Mask } from 'component';

import {Alert, Valid, Storage, MD5, Page, CheckBroswer, GetUrlParam} from 'util';
import { StoreNim, StoreChatroom, StoreNetcall } from "store";

import platform from 'platform';
import EXT_NIM from "ext/nim";
import EXT_CHAT from "ext/chatroom";

const NimState = StoreNim.state;
const NimAction = StoreNim;
const ChatroomAction = StoreChatroom;
const NetcallAction = StoreNetcall;
const NetcallState = StoreNetcall.state;

@observer
export default class Login extends Component {
  state = {
    loading: false,
    account: '',
    pwd: '',
    errorTip: '', //登录错误消息
    showErrorTip: false,
    canLogin: false, //是否可登录
    hasAccount: false,
    hasPwd: false,
    className: '',
    loginLoading: false //登录中状态
  };

  componentDidMount() {
    CheckBroswer({
      success: this.autoLogin.bind(this)
    });
  }



  autoLogin() {
    // debugger
    this.setState({
      loginLoading: true
    });
    if (NimState.account) {
      console.log('已登录，自动切换到home');
      // Page.to('home');
      this.requestHome ();
      return;
    }

    console.log('login:开始自动登录nim过程...');

    // const account = Storage.get('account');
    // const token = Storage.get('token');

    // const account = Storage.get('account');
    // const token = Storage.get('token');

    // if (!account || !token) {
    //   console.warn('login:自动登录nim:缺少account或token，首次登陆请忽略！');
    //   this.accountInput.focus();

      let nickname = Valid.getUrlParam ('nickname');
      let username = Valid.getUrlParam ('username');
      let password = Valid.getUrlParam ('pwd');
      let roomName = Valid.getUrlParam ('roomName');
      let roomType = Valid.getUrlParam ('roomType');

      // this.requestLogin({
      //   account: username,
      //   pwd: password,
      //   roomName: roomName,
      //   roomType: roomType
      // });

    this.requestHome ();

      // return;
    // }

    // this.setState({
    //   showErrorTip: false,
    //   errorTip: '',
    //   loginLoading: true
    // });

    //NIM自动登录
    // EXT_NIM.login(account, token)
    //   .then(() => {
    //     console.log('login:自动登录nim成功');
    //
    //     // Page.to('home');
    //     this.requestHome ();
    //   })
    //   .catch((error) => {
    //     console.error('login:自动登录nim失败');
    //
    //
    //     if (error === '帐号或密码错误') {
    //       // 没有的用户 先注册
    //       // this.requestLogin({
    //       //   account: username,
    //       //   pwd: '12345678qw9'
    //       // });
    //     }
    //
    //
    //     // this.setState({
    //     //   showErrorTip: true,
    //     //   errorTip: error,
    //     //   loginLoading: false
    //     // });
    //     //
    //     // this.accountInput.focus();
    //   });
  }

  changeAccount = e => {
    const account = e.target.value;
    if (Valid.isBlank(account)) {
      this.setState({
        hasAccount: false,
        account: '',
        canLogin: false
      });
      return;
    }

    this.setState((prevState, props) => ({
      hasAccount: true,
      account: account.trim(),
      canLogin: prevState.hasPwd
    }));
  };

  changePwd = e => {
    const pwd = e.target.value;
    if (Valid.isBlank(pwd)) {
      this.setState({
        hasPwd: false,
        pwd: '',
        canLogin: false
      });
      return;
    }

    this.setState((prevState, props) => ({
      hasPwd: true,
      pwd: pwd.trim(),
      canLogin: prevState.hasAccount
    }));
  };

  submit = () => {
    if (!this.state.canLogin || this.state.loginLoading) {
      console.log('不可点击登录或正在登录中...');
      return;
    }

    //预防性控制
    if (Valid.isBlank(this.state.account)) {
      this.setState({
        showErrorTip: true,
        errorTip: '账号不能为空'
      });
      return;
    }

    if (Valid.isBlank(this.state.pwd)) {
      this.setState({
        showErrorTip: true,
        errorTip: '密码不能为空'
      });
      return;
    }

    this.setState({
      showErrorTip: false,
      errorTip: '',
      loginLoading: true
    });

    console.log(this.state.account)
    //NIM登录
    this.requestLogin({
      account: this.state.account,
      pwd: this.state.pwd
    });
  };

  regist() {
    console.log('跳转到注册页...');

    // Page.to('regist');
  }

  requestLogin(data) {
    const account = data.account;
    const token = MD5(data.pwd);
    const roomName = data.roomName;
    const roomType = data.roomType;

    //直接登录
    EXT_NIM.login(account, token, roomName, roomType)
      .then(() => {
        console.log('登录成功');

        //用于在非登录页面登录
        Storage.set('account', data.account);
        Storage.set('token', token);
        Storage.set('roomName', roomName);
        Storage.set('roomType', roomType);

        // Page.to('home');
        this.requestHome ();
      })
      .catch((error, a, b) => {
        console.log(error,a,b)
        // this.accountInput.focus();

        let nickname = Valid.getUrlParam ('nickname');
        let username = Valid.getUrlParam ('username');

        if (!nickname || !username) alert('没有用户名和昵称');

        this.setState({
          loginLoading: false
        });

        console.log("用户名：" + Valid.getUrlParam ('username'),"密码：" + Valid.getUrlParam ('pwd'));
        alert(error);

        //帐号或密码错误
        if (error === '帐号或密码错误') {
          //进行注册处理
          //NIM注册
          // this.requestRegist({
          //   username: username,
          //   nickname: nickname,
          //   password: '12345678qw9'
          // });
        }

        // this.setState({
        //   showErrorTip: true,
        //   errorTip: error,
        //   loginLoading: false
        // });
      });
  }

  // requestRegist(data) {
  //   EXT_NIM.regist(data)
  //     .then(() => {
  //       alert('注册成功');
  //
  //       //自动登录并跳转到主页
  //       this.requestLogin({
  //         account: this.state.username,
  //         pwd: this.state.password
  //       });
  //     })
  //     .catch(error => {
  //       console.error('注册失败', error);
  //
  //       if (error === '帐号已注册') {
  //         debugger
  //         const account = data.username;
  //         const token = MD5(data.password);
  //
  //         Storage.set('account', account);
  //         Storage.set('token', token);
  //         Storage.set('roomName', Valid.getUrlParam ('roomName'));
  //         Storage.set('roomType', Valid.getUrlParam ('roomType'));
  //         debugger
  //         // Page.to('home');
  //         this.requestHome ();
  //       }
  //
  //       // this.usernameInput.focus();
  //       //
  //       // this.setState({
  //       //   showErrorTip: true,
  //       //   errorTip: error,
  //       //   registLoading: false
  //       // });
  //     });
  // }

  requestCreatRoom (roomName,data) {
    // debugger

    const account = Storage.get("account");
    const token = Storage.get("token");

    //步骤1：NIM登录  创建房间
    EXT_NIM.login(account, token).then(()=>{
      //创建房间
      EXT_CHAT.create(roomName)
        .then(id => {
          console.log("创建聊天室房间成功", id);

          Storage.set("teacherAccount", NimState.account);

          // 创建成功后就登录聊天室
          EXT_CHAT.login(id)
            .then(() => {
              console.log("加入房间成功");

              //用于刷新自动进入
              Storage.set("roomId", id);
              Storage.set("isTeacher", 1);
              Storage.set("hasPermission", true);

              this.setState({
                loginLoading: false
              });

              // EXT_CHAT.sendChatRoomInfo({
              //
              // }).then(()=>{
              //
              // });
              // debugger
              //加入房间后直接跳转到白板页面
              this.preHandleRedirect();
            })
            .catch(error => {
              console.error("加入房间失败", error);
              console.error("创建roomId失败", error);
              // alert("加入房间失败");
              //错误消息无内容时的容错
              if (!error) {
                error = "加入房间失败";
              }

              this.setState({
                showRoomNameTip: true,
                roomNameErrorMsg: error,
                createLoading: false,
              });
              this.setState({
                loginLoading: false
              });
            });
        })
        .catch(error => {
          console.error("创建房间失败", error);
          alert('创建房间失败');
          //提示文案调整
          if (error == "聊天室已关闭") {
            error = "房间不存在";
          }

          // this.setState({
          //   showRoomNameTip: true,
          //   roomNameErrorMsg: error,
          //   createLoading: false
          // });
        });
    });
  }

  requestJoinRoom (roomName) {
    this.state.roomId = roomName;
    const account = Storage.get("account");
    const token = Storage.get("token");


    //步骤1：NIM登录  创建房间
    EXT_NIM.login(account, token).then(()=>{
      //加入房间
      EXT_CHAT.login(this.state.roomId)
        .then(() => {
          console.log("加入房间成功");

          //用于刷新自动进入
          Storage.set("roomId", this.state.roomId);
          Storage.set("isTeacher", 0);

          //加入房间后直接跳转到白板页面
          this.preHandleRedirect();
        })
        .catch(error => {
          console.error("加入房间失败", error);

          //提示文案调整
          if (error == "聊天室已关闭") {
            error = "房间不存在";
          }

          //错误消息无内容时的容错
          if (!error) {
            error = "加入房间失败";
          }

          this.setState({
            loginLoading: false
          });

          this.setState({
            showRoomIdTip: true,
            roomIdErrorMsg: error,
            joinLoading: false
          });
        });
    })
  }

  requestHome (data){
    // const account = Storage.get("account");
    // const token = Storage.get("token");
    // const roomName = Storage.get("roomName");
    // const roomType = Storage.get("roomType");
    // console.log("创建房间 roomName",roomName);

    let nickname = Valid.getUrlParam ('nickname');
    let username = Valid.getUrlParam ('username');
    let password = Valid.getUrlParam ('pwd');
    let roomName = Valid.getUrlParam ('roomName');
    let roomType = Valid.getUrlParam ('roomType');
    let roomNo = Valid.getUrlParam ('roomNo');

    StoreNim.state.token = password;
    StoreNim.state.account = username;

    // debugger
    //用于在非登录页面登录
    Storage.set('account', username);
    Storage.set('token', password);
    Storage.set('roomName', roomName);
    Storage.set('roomType', roomType);
    Storage.set('nickName', nickname);


    if (roomType === 'creat') {
      this.requestCreatRoom (roomName,data);
    } else if (roomType === 'join') {
      this.requestJoinRoom (roomNo,data);
    } else {
      alert('请在会诊系统中重新进入');
        if (navigator.userAgent.indexOf("Firefox") != -1 || navigator.userAgent.indexOf("Chrome") !=-1) {
            window.location.href="about:blank";
            window.close();
        } else {
            window.opener = null;
            window.open("", "_self");
            window.close();
        }
    }

  }

  preHandleRedirect() {
    //检测当前机器的可用设备
      console.info("20200225 设备检测第一遍");
    console.log("检测当前机器的可用设备....");
    WebRTC.checkCompatibility()
      .then(data => {
        // debugger
        let hasCamera = data.Camera;
        let hasMicrophone = data.Microphone;
        console.log("--- 设备状态", data);

        //设置当前用户的麦克风与摄像头的状态
        NetcallAction.setHasAudio(hasMicrophone);
        NetcallAction.setHasVideo(hasCamera);
      })
      .catch(error => {
        // debugger
        console.error("获取当前机器可用设备时异常: ", error);
        NetcallAction.setHasAudio(false);
        NetcallAction.setHasVideo(false);
      });

    console.info("20200225 go to main");
    Page.to("main");
  }

  loadingControl () {
    return this.state.loginLoading ? 'm-login loading' : 'm-login'
  }

  render() {
    // console.log('render login');
    const state = this.state;
    return (
      <div className={ this.loadingControl() }>

      </div>
    );
  }
}




