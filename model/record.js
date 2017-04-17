/**
 * 各种后台记录数据
 * Created by yuansc on 2017/3/12.
 */
'use strict';
const mongoose = require('mongoose');
const constants = require('../utils/constants');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const RecordSchema = new Schema({
  userId: {type: ObjectId, require: true},
  type: {type: String, enum: [constants.RECORD_TYPE_VIEW, constants.RECORD_TYPE_SCAN, constants.RECORD_TYPE_SEARCH]},
  content: String,
  createTime: {type: Date, default: Date},
  updateTime: {type: Date, default: Date}
});

RecordSchema.pre('save', function (next) {
  this.updateTime = new Date();
  next();
});

mongoose.model("Record", RecordSchema);
