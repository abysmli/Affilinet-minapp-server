/**
 * 浏览历史 Controller
 * Created by yuansc on 2017/3/14.
 */
"use strict";
let genres = require('../utils/genres');
let historyService = require('../service/history');
let HistoryController = module.exports = {};

/**
 * @api {get} /history/list 获取我的浏览记录
 * @apiName GetViewHistory
 * @apiGroup History
 * @apiDescription 获取我的浏览记录,按照浏览时间倒排序,如果多次浏览同一笔记,按最后一次时间计算
 *
 * @apiParam {Number} [skip=0] 翻页skip
 * @apiParam {Number} [limit=20] 翻页limit
 *
 * @apiParamExample {json} Request-Example:
 * {
 *    返回结果同 note list
 * }
 */
HistoryController.list = async function (ctx) {
  let userId = ctx.state.user.userId;
  let skip = parseInt(ctx.request.query.skip || 0);
  let limit = parseInt(ctx.request.query.limit || 20);
  let obj = await historyService.list(userId, skip, limit);
  ctx.body = genres.success(obj.list, {isMore: skip + limit < obj.count});
};
