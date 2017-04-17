/**
 * 浏览记录表，为了代码规范命名为history
 * Created by yuansc on 2017/3/14.
 */
"use strict";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const HistorySchema = new Schema({
  userId: {type: ObjectId, require: true},
  note: {type: ObjectId, ref: 'Note', require: true},

  createTime: {type: Date, default: Date},
  updateTime: {type: Date, default: Date}
});

HistorySchema.pre('save', function (next) {
  this.updateTime = new Date();
  next();
});

HistorySchema.index({userId: 1, _id: -1});
HistorySchema.index({userId: 1, note: 1}, {unique: true});

mongoose.model('History', HistorySchema);