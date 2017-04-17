/**
 * Created by yuansc on 2017/3/18.
 */
"use strict";
const genres = require('../utils/genres');
const favoriteService = require('../service/favorite');
let FavoriteController = module.exports = {};

/**
 * @api {POST} /favorites/add/:noteId 添加收藏
 * @apiName AddFavorite
 * @apiGroup Favorite
 * @apiDescription 添加收藏，已经收藏过的提示已经收藏过了
 *
 * @apiParam {String} noteId 笔记ID
 * @apiSuccessExample {json} Success-Response:
 *{
 *  "ok": true,
 *  "code": 0,
 *  "data": "ok",
 *  "message": ""
 * }
 */
FavoriteController.add = async function (ctx) {
  let userId = ctx.state.user.userId;
  let noteId = ctx.params.noteId;
  await favoriteService.add(userId, noteId);
  ctx.body = genres.success('ok');
};

/**
 * @api {DELETE} /favorites/remove/:noteId 取消收藏
 * @apiName RemoveFavorite
 * @apiGroup Favorite
 * @apiDescription 取消收藏
 * @apiParam {String} noteId 笔记ID
 * @apiSuccessExample {json} Success-Response:
 *{
 *  "ok": true,
 *  "code": 0,
 *  "data": "ok",
 *  "message": ""
 * }
 */
FavoriteController.remove = async function (ctx) {
  let userId = ctx.state.user.userId;
  let noteId = ctx.params.noteId;
  await favoriteService.remove(userId, noteId);
  ctx.body = genres.success('ok');
};

/**
 * @api {GET} /favorites/list 获取我的收藏列表
 * @apiName GetFavorites
 * @apiGroup Favorite
 * @apiDescription 获取我的收藏列表
 * @apiSuccessExample {json} Success-Response:
 *{
 *  "ok": true,
 *  "code": 0,
 *  "isMore": false,
 *  "data": "ok",
 *  "message": ""
 * }
 */
FavoriteController.list = async function (ctx) {
  let userId = ctx.state.user.userId;
  let skip = parseInt(ctx.request.query.skip || 0);
  let limit = parseInt(ctx.request.query.limit || 20);
  let obj = await favoriteService.list(userId, skip, limit);
  ctx.body = genres.success(obj.list, {isMore: skip + limit < obj.count});
};
