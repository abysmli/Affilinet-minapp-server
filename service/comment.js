/**
 * 评论Service
 * Created by yuansc on 2017/3/14.
 */
"use strict";
const ObjectId = require('mongoose').Types.ObjectId;
const exception = require('../utils/exception');
const Comment = require('../model').Comment;
const Note = require('../model').Note;
let CommentService = module.exports = {};
/**
 * 添加评论
 * @param noteId {String} 笔记ID
 * @param userId {String} 用户ID
 * @param content {String} 评论内容
 */
CommentService.add = async function (noteId, userId, content) {
  let note = await Note.findById(noteId).exec();
  if (!note) {
    throw exception.NOTE_NOT_EXIST;
  }
  await new Comment({author: new ObjectId(userId), content: content, noteId: new ObjectId(noteId)}).save();
};

/**
 * 获取评论列表
 * @param noteId {String} 笔记ID
 * @param skip {Number}  翻页skip
 * @param limit {Number} 翻页limit
 */
CommentService.list = async function (noteId, skip, limit) {
  let list = await Comment.find({noteId: new ObjectId(noteId)}).skip(skip).limit(limit).sort({_id: -1})
    .populate('author', {avatar: 1, _id: 1, nickName: 1, state: 1})
    .exec();
  let count = await Comment.count({noteId: new ObjectId(noteId)}).exec();
  return {list: list, count: count};
};