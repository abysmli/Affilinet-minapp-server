/**
 * Created by yuansc on 2017/3/16.
 */
"use strict";
const util = require('util');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const config = require('config');
const request = require('superagent');
const exception = require('./exception');
const WxDecrypt = require('./WXBizDataCrypt');
const AccessToken = require('../model').AccessToken;
const Lock = require('../model').Lock;
const imageUtils = require('./image');
let UserUtils = module.exports = {};

const WX_AUTH_URL = "https://api.weixin.qq.com/sns/jscode2session?appid=%s&secret=%s&js_code=%s&grant_type=authorization_code";
const WX_GET_TOKEN_URL = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=%s&secret=%s";
const WX_QRCODE_URL = "https://api.weixin.qq.com/wxa/getwxacode?access_token=%s";
/**
 * 根据用户登陆返回code，去微信获取sessionKey
 * @param code {String} 登陆时获取的code
 * @returns object {openid: '', sessionKey:''}
 */
UserUtils.getSessionKey = async function (code) {
  let url = util.format(WX_AUTH_URL, config.get('appId'), config.get('appSecret'), code);
  let res = await request(url);
  console.log('weixin auth response:', res.text, 'code:', code);
  let resBody = JSON.parse(res.text);
  if (resBody.openid && resBody.session_key) {
    return {openid: resBody.openid, sessionKey: resBody.session_key};
  }
  if (res.status != 200) {
    throw exception.AUTH_FAILED;
  }
  throw exception.AUTH_FAILED;
};

/**
 * 根据用户上传的encrypted iv sessionKey等信息获取加密的用户信息
 * @param encrypted
 * @param iv
 * @param sessionKey
 */
UserUtils.decode = function (encrypted, iv, sessionKey) {
  let pc = new WxDecrypt(config.get('appId'), sessionKey);
  return pc.decryptData(encrypted, iv);
};

/**
 * 获取指定页面的二维码
 * @param qrPath
 * @param userId
 * @returns {Promise.<*>}
 */
UserUtils.genQrCode = async function (qrPath, userId) {
  let token = await getAccessToken();
  let filePath = path.join(__dirname, '../', 'public/qrcode', userId + '.jpg');
  let exist = fs.existsSync(filePath);
  if(exist){
    return imageUtils.genUrlByPath(filePath);
  }
  let url = util.format(WX_QRCODE_URL, token);
  await request.post(url).send({path: qrPath}).pipe(fs.createWriteStream(filePath));
  return imageUtils.genUrlByPath(filePath);
};
/**
 * 获取access_token
 * @returns {Promise.<*>}
 */
async function getAccessToken() {
  let token = await AccessToken.findOne({}).exec();
  if (!token || token.time + token.expire * 1000 <= Date.now()) {
    let result = await Lock.update({type: 'token'}, {$set: {lock: true}}, {new: true, upsert: true}).exec();
    if (!result.upserted && result.nModified == 0) {
      console.log('someone is trying to get access token, not do again');
      throw exception.RETRY_LATER;
    }
    let url = util.format(WX_GET_TOKEN_URL, config.get('appId'), config.get('appSecret'));
    let res = await request(url);
    let body = JSON.parse(res.text);
    if (_.isEmpty(body.access_token)) {
      throw exception.SERVER_ERROR;
    }
    if (!token) {
      token = new AccessToken();
    }
    token.time = Date.now();
    token.expire = parseInt(body.expires_in);
    token.accessToken = body.access_token;
    await token.save();
    await Lock.update({type: 'token'}, {$set: {lock: false}}).exec();
    return token.accessToken;
  } else {
    return token.accessToken;
  }
}
