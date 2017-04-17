/**
 * 浏览历史记录
 * Created by yuansc on 2017/3/14.
 */
"use strict";
const _ = require('lodash');
const ObjectId = require('mongoose').Types.ObjectId;
const History = require('../model').History;
const Note = require('../model').Note;
let HistoryService = module.exports = {};

/**
 * 增加历史浏览历史记录, 浏览过的只更新最后阅读时间，没浏览的增加浏览记录
 * @param userId
 * @param noteId
 * @returns {Promise.<void>}
 */
HistoryService.add = async function (userId, noteId) {
  let history = await History.findOne({userId: new ObjectId(userId), note: new ObjectId(noteId)}).exec();
  //对于没有浏览过的笔记，笔记浏览数+1， 并插入一条history
  if (!history) {
    await Note.update({_id: new ObjectId(noteId)}, {$inc: {views: 1}});
    history = new History({
      userId: new ObjectId(userId),
      note: new ObjectId(noteId)
    })
  }
  history.updateTime = new Date();
  await history.save();
};

/**
 * 获取我的浏览历史记录，用skip,limit进行分页
 * @param userId
 * @param skip
 * @param limit
 */
HistoryService.list = async function (userId, skip, limit) {
  let historys = await History.find({userId: new ObjectId(userId)}).sort({updateTime: -1}).skip(skip).limit(limit).populate('note').exec();
  let notes = _.map(historys, function (item) {
    return item.note
  });
  let list = _.filter(notes, function (item) {
    return !!item
  });
  let count = await History.count({userId: new ObjectId(userId)}).exec();
  return {list: list, count: count};
};
