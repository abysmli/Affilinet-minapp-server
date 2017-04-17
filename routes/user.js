/**
 * 用户Controller
 * Created by yuansc on 2017/3/8.
 */
"use strict";
const config = require('config');
const jwt = require('jsonwebtoken');
const userService = require('../service/user');
const exception = require('../utils/exception');
const genres = require('../utils/genres');
const userUtils = require('../utils/user');
let UserController = module.exports = {};
/**
 * @api {post} /users/login 用户登陆接口
 * @apiName UserLogin
 * @apiGroup User
 * @apiDescription 用户登陆接口，第一次访问默认注册，之后访问不再注册，只更新用户信息
 * @apiParamExample {json} Request-Example:
 * {
 *    //各字段什么作用请参见 https://mp.weixin.qq.com/debug/wxadoc/dev/api/open.html#wxgetuserinfoobject
 *   userInfo: Object,
 *   rawData: String,
 *   signature: String,
 *   encryptedData: String,
 *   iv: String,
 *   code: String //微信登陆时返回的code
 * }
 *  @apiSuccessExample {json} Success-Response:
 *  {
 *     "ok": true,
 *    "code": 0,
 *    "data": {
 *      "token":"",
 *      "userId":""
 *    }, //项目认证机制采用jsonwebtoken
 *    "message": ""
 *  }
 */
UserController.login = async function (ctx) {
  let body = ctx.request.body;
  let encrypted = body.encryptedData;
  let iv = body.iv;
  let code = body.code;
  let userInfo = {};
  //解密微信数据
  let wxObj = await userUtils.getSessionKey(code);
  try {
    userInfo = userUtils.decode(encrypted, iv, wxObj.sessionKey);
  } catch (e) {
    throw exception.MISSING_PARAMETER;
  }
  userInfo.avatar = userInfo.avatarUrl;
  let user = await userService.login(userInfo);
  let briefUser = {
    userId: user._id,
    nickName: user.nickName,
    avatar: user.avatar,
    gender: user.gender,
    state: user.state
  };
  let token = jwt.sign(briefUser, config.get('jwt-secret'), {expiresIn: config.get("jwt-expire")});
  ctx.body = genres.success({token: token, userId: user._id});
};

/**
 * @api {get} /users/code 获取用户二维码
 * @apiName GetUerQrCode
 * @apiGroup User
 * @apiDescription 获取用户列表页的二维码
 * @apiSuccessExample {json} Success-Response:
 *  {
 *     "ok": true,
 *    "code": 0,
 *    "data": "QRCODE 二维码 地址"
 *    "message": ""
 *  }
 */
UserController.genQrCode = async function(ctx){
  let userId = ctx.state.user.userId;
  let url = await userService.genQrCode(userId, ctx.state.user.nickName);
  ctx.body= genres.success(url);
};