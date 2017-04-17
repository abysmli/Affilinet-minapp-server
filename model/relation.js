/**
 * 用户关系表
 * Created by yuansc on 2017/3/12.
 */
"use strict";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const RelationSchema = new Schema({
  from: {type: ObjectId, ref: 'User', require: true},
  to: {type: ObjectId, ref: 'User', require: true},
  createTime: {type: Date, default: Date},
  updateTime: {type: Date, default: Date}
});

RelationSchema.pre('save', function (next) {
  this.updateTime = new Date();
  next();
});

RelationSchema.index({from: 1, to: 1}, {unique: true});
RelationSchema.index({from: 1, updateTime: -1});

mongoose.model('Relation', RelationSchema);
