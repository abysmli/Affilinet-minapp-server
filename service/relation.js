/**
 * Created by yuansc on 2017/3/13.
 */
"use strict";
const _ = require('lodash');
const ObjectId = require('mongoose').Types.ObjectId;
const Relation = require('../model').Relation;
let RelationService = module.exports = {};
/**
 * 保存用户关系 当已有此用户关系 更新updateTime
 * @param from {String} 关注者Id
 * @param to {String} 被关注者Id
 */
RelationService.add = async function (from, to) {
  let relation = await Relation.findOne({from: new ObjectId(from), to: new ObjectId(to)}).exec();
  if (!relation) {
    relation = new Relation({
      from: new ObjectId(from),
      to: new ObjectId(to)
    });
  }
  relation.updateTime = new Date();
  await relation.save();
};

/**
 * 获取用户好友，按照updateTime倒叙排列
 * @param userId {String} 用户Id
 * @param skip {Number} 翻页skip
 * @param limit {Number} 翻页limit
 */
RelationService.list = async function (userId, skip, limit) {
  let relations = await Relation.find({from: new ObjectId(userId)}).skip(skip).limit(limit).sort({updateTime: -1}).populate('to').exec();
  let list = _.map(relations, function (item) {
    return item.to
  });
  let users = _.filter(list, function (item) {
    return !!item
  });
   let count = await  Relation.count({from: new ObjectId(userId)}).exec();
  return {list: users, count: count}
};