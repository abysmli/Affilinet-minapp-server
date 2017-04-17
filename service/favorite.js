/**
 * 收藏
 * Created by yuansc on 2017/3/18.
 */
"use strict";
const _ = require('lodash');
const ObjectId = require('mongoose').Types.ObjectId;
const Favorite = require('../model').Favorite;
const Note = require('../model').Note;
const exception = require('../utils/exception');
const constants = require('../utils/constants');
let FavoriteService = module.exports = {};

/**
 * 添加收藏，已经收藏的返回已经收藏
 * @param userId
 * @param note
 */
FavoriteService.add = async function (userId, noteId) {
  let note = await Note.findById(noteId).exec();
  if (!note || note.state < constants.NOTE_STATE_OPEN) {
    throw exception.NOTE_NOT_EXIST;
  }
  if (note.author.toString() == userId) {
    throw exception.CAN_NOT_FAVORITE;
  }
  let favorite = await Favorite.findOne({userId: new ObjectId(userId), note: new ObjectId(noteId)}).exec();
  if (favorite) {
    throw exception.HAVE_FAVORITE;
  }
  favorite = new Favorite({userId: new ObjectId(userId), note: new ObjectId(noteId)});
  await favorite.save();
};

/**
 * 获取我的收藏列表
 * @param userId
 * @param skip
 * @param limit
 * @returns {Query|*}
 */
FavoriteService.list = async function (userId, skip, limit) {
  let favorites = await Favorite.find({userId: new ObjectId(userId)}).sort({_id: -1}).skip(skip).limit(limit).populate('note').exec();
  let notes = _.map(favorites, function (item) {
    return item.note
  });
  let list = _.filter(notes, function (item) {
    return !!item
  });
  let count = await Favorite.count({userId: new ObjectId(userId)});
  return {list: list, count: count};
};
/**
 * 取消收藏
 * @param userId
 * @param note
 */
FavoriteService.remove = async function (userId, note) {
  await Favorite.remove({userId: new ObjectId(userId), note: new ObjectId(note)});
};