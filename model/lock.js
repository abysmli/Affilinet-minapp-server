/**
 * 分布式锁
 * Created by yuansc on 2017/3/18.
 */
"use strict";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LockSchema = new Schema({
  lock: {type: Boolean, default: false},
  type: {type: String, default: 'token'},
  createTime: {type: Date, default: Date}
});

LockSchema.index({createTime:1}, {expireAfterSeconds: 60});
mongoose.model('Lock', LockSchema);