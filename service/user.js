/** User Service
 * Created by yuansc on 2017/3/13.
 */
"use strict";
const _ = require('lodash');
const util = require('util');
const config = require('config');
const User = require('../model').User;
const Note = require('../model').Note;
const Counter = require('../model').Counter;
const userUtils = require('../utils/user');
const constants = require('../utils/constants');
const exception = require('../utils/exception');
const defaultNotes = require('../utils/notes.json');
let UserService = module.exports = {};
const PAGE_PATH = "pages/noteList?shareNote=true?userId=%s&nickName=%s";

/**
 * 用户登录时 如果已注册 则更新用户名头像及updateTime
 * @param userInfo
 * @returns {Promise.<void>}
 */
UserService.login = async function (userInfo) {
  let newUser = false;
  let user = await User.findOne({openId: userInfo.openId}).exec();
  if (!user) {
    newUser = true;
    user = new User(userInfo);
    let counter = await Counter.findOneAndUpdate({name: 'user'}, {$inc: {count: 1}}, {new: true, upsert: true}).exec();
    if (counter.count <= config.get('seedUserNum')) {
      user.state = constants.USER_STATE_SEED;
    }
  }
  user.avatar = userInfo.avatar;
  user.nickName = userInfo.nickName;
  await user.save();
  if (newUser) {
    let notes = _.map(defaultNotes.reverse(), function (item) {
      item.author = user._id;
      item.createTime = new Date();
      item.updateTime = new Date();
      return item;
    });
    await Note.create(notes);
  }
  return user.toJSON();
};
/**
 * 根据用户ID生成二维码
 * @param userId
 * @param nickName
 * @returns {Promise.<*>}
 */
UserService.genQrCode = async function (userId, nickName) {
  let user = await User.findById(userId).exec();
  if (user.state < constants.USER_STATE_SEED) {
    throw exception.NOT_SEED;
  }
  let path = util.format(PAGE_PATH, userId, nickName);
  return await userUtils.genQrCode(path, userId);
};
