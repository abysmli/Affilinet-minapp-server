/**
 * 收藏数据model
 * Created by yuansc on 2017/3/18.
 */
"use strict";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const FavoriteSchema = new Schema({
  userId: {type: ObjectId, require: true},
  note: {type: ObjectId, ref: 'Note', require: true},
  createTime: {type: Date, default: Date},
  updateTime: {type: Date, default: Date}
});

FavoriteSchema.pre('save', function (next) {
  this.updateTime = new Date();
  next();
});

FavoriteSchema.index({userId: 1, updateTime: -1});
FavoriteSchema.index({userId: 1, note: 1}, {unique: true});

mongoose.model('Favorite', FavoriteSchema);
