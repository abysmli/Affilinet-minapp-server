/**
 * 笔记相关Service
 * Created by yuansc on 2017/3/14.
 */
"use strict";
let _ = require('lodash');
let config = require('config');
let errs = require('errs');
let util = require('util');
let request = require('superagent');
const ObjectId = require('mongoose').Types.ObjectId;
const exception = require('../utils/exception');
const constants = require('../utils/constants');
const Note = require('../model').Note;
const Favorite = require('../model').Favorite;
const recordService = require('./record');
//for log
let log4js = require('log4js');
let logger = log4js.getLogger();
logger.setLevel(config.get('logLevel'));

let NoteService = module.exports = {};

/**
 * 新建笔记
 * @param noteInfo 笔记Obj
 * @returns {Promise.<void>}
 */
NoteService.add = async function (noteInfo) {
  delete noteInfo._id;
  let note = new Note(noteInfo);
  await note.save();
};

/**
 * 获取笔记详情，对于笔记的author字段，返回笔记作者详情
 * @param noteId
 * @param userId
 * @returns {Promise.<void>}
 */
NoteService.getDetail = async function (noteId, userId) {
  let note = await Note.findById(noteId).populate('author', {avatar: 1, nickName: 1, gender: 1, state: 1}).exec();
  if (!note || note.state == constants.NOTE_STATE_DELETE) {
    throw exception.NOTE_NOT_EXIST;
  }
  if (note.state < constants.NOTE_STATE_OPEN && userId != note.author._id.toString()) {
    throw  _.merge(exception.NOTE_NOT_SHARE, {user: note.author});
  }
  note = note.toJSON();
  let favorite = await Favorite.findOne({userId: new ObjectId(userId), note: new ObjectId(noteId)}).exec();
  note.hasFavorite = !!favorite;
  if (note.views == 0) {
    note.views = 1;
  }
  return note;
};

/**
 * 根据笔记状态获取笔记列表，用于区分是看自己的笔记列表，还是看别人的笔记列表
 * @param userId
 * @param state 笔记状态，详情见utils/constants文件
 * @param skip
 * @param limit
 */
NoteService.listByState = async function (userId, state, skip, limit) {
  let query = {
    author: new ObjectId(userId),
    state: {$gte: state}
  };
  let list = await Note.find(query).skip(skip).lean().limit(limit).sort({updateTime: -1}).exec();
  let count = await Note.count(query).exec();
  return {list: list, count: count};
};

/**
 * 分享笔记，根据笔记ID更改笔记state
 * @param noteId
 * @param userId
 * @returns {Promise.<void>}
 */
NoteService.share = async function (noteId, userId) {
  let note = await Note.findById(noteId).exec();
  if (!note) {
    throw exception.NOTE_NOT_EXIST;
  }
  if (note.author.toString() != userId) {
    throw exception.NO_PERMISSION;
  }
  note.state = constants.NOTE_STATE_OPEN;
  await note.save();
};

/**
 * 更新笔记，对于author state from _id view不进行更新
 * @param note
 * @param userId
 * @returns {Promise.<void>}
 */
NoteService.update = async function (note, userId) {
  let origin = await Note.findById(note.noteId).exec();
  if (!origin) {
    throw  exception.NOTE_NOT_EXIST;
  }
  if (origin.author.toString() != userId) {
    throw exception.NO_PERMISSION;
  }
  for (let key of Object.keys(note)) {
    if (_.includes(['_id', 'from', 'createTime', 'updateTime', 'views', 'author'])) {
      continue;
    }
    origin[key] = note[key];
  }
  await origin.save();
};

/**
 * 删除笔记，只能删除自己的笔记
 * @param noteId
 * @param userId
 * @returns {Promise.<void>}
 */
NoteService.delete = async function (noteId, userId) {
  let note = await Note.findById(noteId).exec();
  if (!note) {
    throw exception.NOTE_NOT_EXIST;
  }
  if (note.author.toString() != userId) {
    throw exception.NO_PERMISSION;
  }
  await Note.remove({_id: new ObjectId(noteId)})
};

/**
 * 根据ean码从第三方获取数据 只返回一条
 * @param ean
 * @param userId
 * @returns {*}
 */
NoteService.searchByEan = async function (ean, userId) {
  await recordService.record(userId, constants.RECORD_TYPE_SCAN, ean);
  let url = util.format(config.get('eanSearchUrl'), ean);
  let begin = Date.now();
  let res = await request(url);
  logger.info(`RequestEanSearchUrlFinish cost ${Date.now() - begin}ms url:${url}`);
  let body = JSON.parse(res.text);
  if (_.isArray(body)) {
    let note = getNoteByThirdInfo(body[0]);
    let images = _.reduce(body, function (a, b) {
      if (!b.ProductImageSet) {
        return a;
      }
      if (a.length < b.ProductImageSet.length) {
        return b.ProductImageSet;
      }
      return a;
    }, []);
    note.images = images;
    return note;

  }
  return [];
};

/**
 * 搜索从第三方获取数据
 * @param query
 * @param userId
 * @returns {*}
 */
NoteService.searchByQuery = async function (query, userId) {
  await recordService.record(userId, constants.RECORD_TYPE_SEARCH, query);
  let url = util.format(config.get('querySearchUrl'), query);
  let begin = Date.now();
  let res = await request(url);
  logger.info(`RequestQuerySearchUrlFinish cost ${Date.now() - begin}ms url:${url}`);
  let body = JSON.parse(res.text);
  if (_.isArray(body)) {
    return _.map(body, getNoteByThirdInfo);
  }
  return [];
};

/**
 * 将第三方数据转为Note Model格式
 * @param thirdNote
 * @returns {{noteId: *, type: string, title: *, image: *, content: (string|string|string|string|string|string|*), productCode: {ean: *, price: *, currency: *}}}
 */
function getNoteByThirdInfo(thirdNote) {
  return {
    noteId: thirdNote._id,
    type: 'third',
    title: thirdNote.TitleCN || thirdNote.Title,
    images: thirdNote.ProductImageSet,
    content: thirdNote.DescriptionCN,
    productCode: {
      ean: thirdNote.EAN,
      price: thirdNote.Price,
      currency: thirdNote.PriceCurrency
    }
  }
}