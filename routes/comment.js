/**
 * Comment Controller
 * Created by yuansc on 2017/3/13.
 */
"use strict";
const _ = require('lodash');
const exception = require('../utils/exception');
const genres = require('../utils/genres');
const commentService = require('../service/comment');
let CommentController = module.exports = {};

/**
 * @api {post} /comments/add 添加评论
 * @apiName AddComment
 * @apiGroup Comment
 * @apiDescription 添加评论
 *
 * @apiParam {String} content 评论内容
 * @apiParam {String} noteId  要评论的笔记ID
 *
 */
CommentController.add = async function (ctx) {
  let content = ctx.request.body.content;
  let noteId = ctx.request.body.noteId;
  let userId = ctx.state.user.userId;

  if (_.isEmpty(content) || _.isEmpty(userId)) {
    throw exception.MISSING_PARAMETER;
  }

  await commentService.add(noteId, userId, content);

  ctx.body = genres.success('ok');
};

/**
 * @api {get} /comments/list/:noteId 获取评论列表
 * @apiName GetCommentList
 * @apiGroup Comment
 * @apiDescription 获取笔记的评论列表
 *
 * @apiParam {String} noteId 笔记ID
 * @apiParam {Number} [skip=0] 翻页skip
 * @apiParam {Number} [limit=20] 翻页limit
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *  "ok": true,
 *  "code": 0,
 *  "isMore": false,
 *  "data": [{
 *    "_id": "58c806b7731f4e21ad7caa42",
 *    "author": {
 *      "_id": "58c8047919c5972070c2644d",
 *      "nickName": "Band",
 *      "avatar": "http://wx.qlogo.cn/mmopen/vi_32/aSKcBBPpibyKNicHNTMM0qJVh8Kjgiak2AHWr8MHM4WgMEm7GFhsf8OYrySdbvAMvTsw3mo8ibKicsnfN5pRjl1p8HQ/0",
 *      "state": 20
 *    },
 *    "content": "123",
 *    "noteId": "58c804cf3a08883954979368",
 *    "__v": 0,
 *    "updateTime": "2017-03-14T15:05:27.767Z",
 *    "createTime": "2017-03-14T15:05:27.000Z"
 *   }],
 *   "message": ""
 * }
 *
 */
CommentController.list = async function (ctx) {
  let noteId = ctx.params.noteId;
  let skip = ctx.request.query.skip || 0;
  let limit = ctx.request.query.limit || 20;
  skip = parseInt(skip);
  limit = parseInt(limit);

  if (_.isEmpty(noteId)) {
    throw exception.MISSING_PARAMETER;
  }
  let obj = await commentService.list(noteId, skip, limit);
  ctx.body = genres.success(obj.list, {isMore: skip + limit < obj.count});
};