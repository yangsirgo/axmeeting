/*
 * @Author: andyzou
 * @Date: 2018-08-26 17:39:36
 * @Last Modified by: andyzou
 * @Last Modified time: 2018-09-13 14:49:56
 */

const Config = {
  'development': {
    appkey: 'b0d8754e06bc139fd6e24572f5f302db',
    url: 'https://www.stephen-curry.online/api',
    resourceUrl: 'http://yx-web.nos.netease.com/webdoc/h5', // 表情、贴图、猜拳消息显示图片前缀
    emojiBaseUrl: 'http://yx-web.nosdn.127.net/webdoc/h5/emoji',
    testH5PPTUrl: 'https://apptest.netease.im/webdemo/ppt/ff1537e0d343821fc509f3165224ab41/index.html',
  },
  'pre-production': {
    appkey: 'b0d8754e06bc139fd6e24572f5f302db',
    url: 'https://192.168.198.161',
    resourceUrl: 'http://yx-web.nos.netease.com/webdoc/h5', // 表情、贴图、猜拳消息显示图片前缀
    emojiBaseUrl: 'http://yx-web.nosdn.127.net/webdoc/h5/emoji',
    testH5PPTUrl: 'https://10.194.105.40:9193/webdemo/ppt/ff1537e0d343821fc509f3165224ab41/index.html',
  },
  'production': {
    appkey: 'b0d8754e06bc139fd6e24572f5f302db',
    url: 'https://www.stephen-curry.online/api',
    resourceUrl: 'http://yx-web.nos.netease.com/webdoc/h5', // 表情、贴图、猜拳消息显示图片前缀
    emojiBaseUrl: 'http://yx-web.nosdn.127.net/webdoc/h5/emoji',
    testH5PPTUrl: 'https://app.yunxin.163.com/webdemo/ppt/ff1537e0d343821fc509f3165224ab41/index.html',
  }
}

const fse = require('fs-extra')
const path = require('path')

const env = process.env.NODE_ENV || 'development'

const contentDist = path.join(__dirname, `../src/env.js`)

fse.outputFileSync(contentDist, `export default ${JSON.stringify(Config[env])}`)
