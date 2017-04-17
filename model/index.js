/**
 * model 入口文件
 * Created by yuansc on 2017/3/12.
 */
"use strict";
const Promise = require('bluebird');
const mongoose = require('mongoose');
const config = require('config');
mongoose.set('debug', config.get('mongooseDebug'));
mongoose.Promise = Promise;
mongoose.connect(config.db, {server: {poolSize: 20}}, function (err) {
  if (err) {
    console.error("connect db error", config.db, err.message);
  }
});

require('./user');
require('./relation');
require('./record');
require('./comment');
require('./note');
require('./history');
require('./favorite');
require('./lock');
require('./accessToken');
require('./counter');

exports.User = mongoose.model('User');
exports.Relation = mongoose.model('Relation');
exports.Record = mongoose.model('Record');
exports.Note = mongoose.model('Note');
exports.Comment = mongoose.model('Comment');
exports.History = mongoose.model('History');
exports.Favorite = mongoose.model('Favorite');
exports.AccessToken = mongoose.model('AccessToken');
exports.Lock = mongoose.model('Lock');
exports.Counter = mongoose.model('Counter');