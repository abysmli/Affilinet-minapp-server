/**
 * Created by yuansc on 2017/3/13.
 */
"use strict";
const Record = require('../model').Record;
const constants = require('../utils/constants');
const ObjectId = require('mongoose').Types.ObjectId;
let RecordService = module.exports = {};

/**
 * 根据用户Id 类型进行相应的数据记录
 * @param userId {ObjectId} 用户ID
 * @param type {String} 类型 enum:['view', 'scan', 'search']
 * @param content {String} 内容，如搜索的内容，查看的内容，扫码的内容等
 */
RecordService.record = async function (userId, type, content) {
  let record = new Record({
    userId: new ObjectId(userId),
    type: type,
    content: content
  });
  await record.save();
};
