/**
 * 异常情况文件
 * Created by yuansc on 2017/3/8.
 */
"use strict";
const error = require('errs');
const exception = module.exports = {
  MISSING_PARAMETER: error.create({code: 100001, message: "参数错误"}),
  NOTE_NOT_EXIST: error.create({code: 100002, message: "笔记已删除"}),
  NO_PERMISSION: error.create({code: 100003, message: "你没有权限进行此操作"}),
  AUTH_FAILED: error.create({code: 100004, message: "认证失败"}),
  HAVE_FAVORITE: error.create({code: 100005, message: "已经收藏过了"}),
  CAN_NOT_FAVORITE: error.create({code: 100006, message: "自己的笔记不能收藏"}),
  RETRY_LATER: error.create({code: 100007, message: "请稍后重试"}),
  SERVER_ERROR: error.create({code: 100008, message: "服务器异常"}),
  CONTENT_TOO_LONG: error.create({code: 100009, message: "笔记内容长度过长"}),
  NOTE_NOT_SHARE: error.create({code: 100010, message: "笔记未公开"}),
  NOT_SEED: error.create({code: 100011, message: "请联系客服获取专属笔记列表二维码"}),
};
