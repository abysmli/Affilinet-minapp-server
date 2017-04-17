/**
 * Created by yuansc on 2017/3/12.
 */
"use strict";
const _ = require('lodash');
const moment = require('moment');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const constants = require('../utils/constants');
const validator = require('./validate');

const NoteSchema = new Schema({
  title: {type: String, require: true},
  author: {type: ObjectId, ref: 'User', require: true, index: true},
  images: [{type: String}],
  tags: [{type: String}],
  content: String,
  //包装详情
  packageDetail: {
    length: {type: Number, min: 0},
    width: {type: Number, min: 0},
    height: {type: Number, min: 0},
    weight: {type: Number, min: 0}
  },
  //产品代码
  productCode: {
    ean: String,
    asin: String,
    styleId: String,
    price: {type: Number, min: 0},
    currency: {'type': String, default: 'CNY', validate: validator.currency}, //货币类型
  },

  location: [{type: Number}],
  //表示笔记状态,分享，删除，私有
  state: {type: Number, require: true, default: constants.NOTE_STATE_PRIVATE},
  //如果是copy别人的，则显示另一个产品ID，可能是当前笔记的ID，也可能是远程服务提供的产品ID
  from: {type: String, require: false},

  views: {type: Number, default: 0},

  createTime: {type: Date, default: Date},
  updateTime: {type: Date, default: Date}
}, {
  toJSON: {
    virtuals: true
  }
});

NoteSchema.virtual('noteId').get(function () {
  return this._id;
});
NoteSchema.virtual('modified').get(function () {
  return moment(this.updateTime).format('YYYY-MM-DD');
});
NoteSchema.pre('save', function (next) {
  this.updateTime = new Date();
  next();
});

NoteSchema.index({author: 1, updateTime: -1});

mongoose.model('Note', NoteSchema);
