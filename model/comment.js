/**
 * 笔记评论model
 * Created by yuansc on 2017/3/12.
 */
"use strict";
const moment = require('moment');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const CommentSchema = new Schema({
  author: {type: ObjectId, ref: 'User', require: true},
  content: {type: String},
  noteId: {type: ObjectId, require: true, index: true},
  createTime: {type: Date, default: Date},
  updateTime: {type: Date, default: Date}
});

CommentSchema.pre('save', function (next) {
  this.updateTime = new Date();
  next();
});

CommentSchema.virtual('modified').get(function(){
  return moment(this.updateTime).format('YYYY-MM-DD');
});
CommentSchema.index({noteId: 1, _id: -1});

mongoose.model('Comment', CommentSchema);



