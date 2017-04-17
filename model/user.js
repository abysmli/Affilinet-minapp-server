/**
 * 用户model
 * Created by yuansc on 2017/3/12.
 */
const mongoose = require('mongoose');
const constants = require('../utils/constants');
const Schema = mongoose.Schema;

const UserSchemam = new Schema({
  openId: {type: String, require: true, unique: true},
  nickName: {type: String, require: true},
  avatar: {type: String, require: true},
  gender: {type: String, require: true},
  //地理信息
  country: String,
  province: String,
  city: String,

  unionId: String,
  watermark: {},//微信watermark,暂时不知道干嘛的

  //用户状态字段 为会员机制预留
  state: {type: Number, default: constants.USRE_STATE_NORMAL},

  createTime: {type: Date, default: Date},
  updateTime: {type: Date, default: Date}
});

/**
 * 每次对用户信息修改前，更新updateTime
 */
UserSchemam.pre('save', function (next) {
  this.updateTime = new Date();
  next();
});

mongoose.model('User', UserSchemam);