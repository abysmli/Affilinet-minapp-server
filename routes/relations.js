/**
 * 用户关系Controller
 * Created by yuansc on 2017/3/13.
 */
"use strict";
let genres = require('../utils/genres');
let relationService = require('../service/relation');
let RelationController = module.exports = {};

/**
 * @api {get} /relations/list 获取我的好友列表
 * @apiName GetRelationList
 * @apiGroup Relation
 * @apiDescription 获取我的好友列表,按最后浏览时间倒叙排列
 *
 * @apiParam {Number} [skip=0] 翻页skip
 * @apiParam {Number} [limit=20] 翻页limit
 *
 *
 */
RelationController.mine = async function (ctx) {
  let userId = ctx.state.user.userId;
  let skip = parseInt(ctx.request.query.skip || 0);
  let limit = parseInt(ctx.request.query.limit || 20);
  let obj = await relationService.list(userId, skip, limit);
  ctx.body = genres.success(obj.list, {isMore: skip + limit < obj.count});
};
