/**
 * 笔记相关Controller
 * Created by yuansc on 2017/3/12.
 */
"use strict";
let _ = require('lodash');
let ObjectId = require('mongoose').Types.ObjectId;
let genres = require('../utils/genres');
let constants = require('../utils/constants');
let exception = require('../utils/exception');
let noteService = require('../service/note');
let historyService = require('../service/history');
let recordService = require('../service/record');
let relationService = require('../service/relation');
let NoteController = module.exports = {};
/**
 * @api {post} /notes/add 新建笔记
 * @apiName AddNote
 * @apiGroup Note
 * @apiDescription 用户新建笔记默认为私有状态
 *
 * @apiParamExample {json} Request-Example:
 * {
 *    "title":"桔子",
 *    "images":["https://www.baidu.com/img/bd_logo1.png"],
 *    "tags":["完美世界"],
 *  	"content":"这是测试的，这里是否要有字数限制",
 *	  "packageDetail":{
 *    "length":1,
 *    "width":233,
 *    "height":33,
 *	    "weight":343434
 *    },
 *    state: 10, //不填默认为10，表示私有状态，20表示分享状态
 *    "productCode":{
 *      "ean":"34343434",
 *      "asin":"3433434",
 *      "price":34344,
 *      "styleId":'',
 *      "currency:['RMB', 'USD', 'EUR']
 *    },
 *    "location": [116.404844, 39.915599], //[lon,lat]
 * }
 * @apiSuccessExample {json} Success-Response:
 *  {
 *    "ok": true,
 *    "code": 0,
 *    "data": "ok",
 *    "message": ""
 *  }
 */
NoteController.add = async function (ctx) {
  let note = ctx.request.body;
  let userId = new ObjectId(ctx.state.user.userId);
  let title = note.title;
  if (_.isEmpty(title)) {
    throw exception.MISSING_PARAMETER;
  }
  note.author = userId;
  await noteService.add(note);
  ctx.body = genres.success('ok');
};


/**
 * @api {get} /notes/detail/:noteId 获取笔记详情
 * @apiName GetNoteDetail
 * @apiGroup Note
 * @apiDescription 获取笔记详情，只有自己能看未分享的笔记，分享的笔记所有人都能看
 *
 * @apiParam {String} noteId 笔记Id
 *
 * @apiParamExample {json} Request-Example:
 * {
 *  "ok": true,
 *  "code": 0,
 *   "data": {
 *      "_id": "58c908bd5ac003ae5f30461c",
 *      "title": "桔子",
 *      "content": "这是测试的，这里是否要有字数限制",
 *      "hasFavorite": true,
 *      "author": {
 *           "_id": "58c7c8c8c4344b4fb4ff4759",
 *           "nickName": "Band",
 *           "gender": "1",
 *           "avatar": "http://wx.qlogo.cn/mmopen/vi_32/aSKcBBPpibyKNicHNTMM0qJVh8Kjgiak2AHWr8MHM4WgMEm7GFhsf8OYrySdbvAMvTsw3mo8ibKicsnfN5pRjl1p8HQ/0",
 *           "state": 20
 *         },
 *      "views": 0,
 *      "state": 10,
 *      "location": [116.404844, 39.915599], //[lon,lat]
 *       "productCode": {
 *          "ean": "34343434",
 *          "asin": "3433434",
 *          "price": 34344,
 *          "styleId": '',
 *          "currency": "CNY"
 *       },
 *      "packageDetail": {
 *          "weight": 343434,
 *          "height": 33,
 *          "width": 233,
 *          "length": 1
 *      },
 *      "tags": [
 *         "完美世界"
 *       ],
 *      "images": [
 *          "https://www.baidu.com/img/bd_logo1.png"
 *      ]
 *     },
 *    "message": ""
 *}
 */
NoteController.detail = async function (ctx) {
  let userId = ctx.state.user.userId;
  let noteId = ctx.params.noteId;
  let note = await noteService.getDetail(noteId, userId);
  if (note.author._id.toString() != userId) {
    await historyService.add(userId, note._id);
    await recordService.record(userId, constants.RECORD_TYPE_VIEW, note._id);
    await relationService.add(userId, note.author._id);
  }
  ctx.body = genres.success(note);

};

/**
 * @api {get} /notes/:uid/list 获取笔记列表
 * @apiName NoteList
 * @apiGroup Note
 * @apiDescription 获取笔记列表,如果uid是自己的id 则获取所有的笔记列表，如果uid是他人id，则获取别人笔记列表(不显示未发布笔记)
 *
 * @apiParam {String} uid 用户ID
 * @apiParam {Number} [skip=0] 翻页skip
 * @apiParam {Number} [limit=20] 翻页limit
 *
 * @apiParamExample {json} Request-Example:
 *  {
 *    "ok": true,
 *    "code": 0,
 *    "isMore": false,
 *    "data": [NOTE_DETAIL], //这里与笔记详情唯一不同的是，列表中的笔记author为ID字符串，详情则是author对象
 *    "message": ""
 *  }
 *
 */
NoteController.list = async function (ctx) {
  let uid = ctx.params.uid;
  let skip = parseInt(ctx.request.query.skip || 0);
  let limit = parseInt(ctx.request.query.limit || 20);
  let userId = ctx.state.user.userId;
  let state = constants.NOTE_STATE_OPEN;
  if (uid == userId) {
    state = constants.NOTE_STATE_PRIVATE;
  }
  let obj = await noteService.listByState(uid, state, skip, limit);
  ctx.body = genres.success(obj.list, {isMore: skip + limit < obj.count});
};

/**
 * @api {post} /notes/share 分享笔记
 * @apiName NoteShare
 * @apiGroup Note
 * @apiDescription 分享笔记,分享后其他人可见
 *
 * @apiParam {String} noteId 笔记ID
 *
 * @apiSuccessExample {json} Success-Response:
 *  {
 *    "ok": true,
 *    "code": 0,
 *    "data": "ok",
 *    "message": ""
 *  }
 */
NoteController.share = async function (ctx) {
  let noteId = ctx.request.body.noteId;
  let userId = ctx.state.user.userId;
  await noteService.share(noteId, userId);
  ctx.body = genres.success('ok');
};

/**
 * @api {post} /notes/copy 复制笔记
 * @apiName NoteCopy
 * @apiGroup Note
 * @apiDescription 复制笔记，相对于新建接口增加了from字段，用来标记从哪一条复制而来
 *
 * @apiParamExample {json} Request-Example:
 * {
 *    内容同新建笔记，比新建笔记多了一个from字段，比较copy的笔记ID
 * }
 * @apiSuccessExample {json} Success-Response:
 *  {
 *    "ok": true,
 *    "code": 0,
 *    "data": "ok",
 *    "message": ""
 *  }
 */
NoteController.copy = async function (ctx) {
  let note = ctx.request.body;
  let userId = new ObjectId(ctx.state.user.userId);
  let title = note.title;
  let from = note.from;
  if (_.isEmpty(title) || _.isEmpty(from)) {
    throw exception.MISSING_PARAMETER;
  }
  note.author = userId;
  await noteService.add(note);
  ctx.body = genres.success('ok');
};

/**
 * @api {post} /notes/update 笔记更新
 * @apiName NoteUpdate
 * @apiGroup Note
 * @apiDescription 更新笔记,需要修改什么字段传什么字段，也可全传
 *
 * @apiParamExample {json} Request-Example:
 * {
 *    noteId: '',//必需字段
 *    内容同新建笔记
 * }
 * @apiSuccessExample {json} Success-Response:
 * {
 *    "ok": true,
 *    "code": 0,
 *    "data": "ok",
 *    "message": ""
 * }
 */
NoteController.update = async function (ctx) {
  let note = ctx.request.body;
  let userId = ctx.state.user.userId;
  let noteId = note.noteId;
  if (_.isEmpty(noteId)) {
    throw exception.MISSING_PARAMETER;
  }
  await noteService.update(note, userId);
  ctx.body = genres.success('ok');
};

/**
 * @api {DELETE} /notes/delete/:noteId 删除笔记
 * @apiName DeleteNote
 * @apiGroup Note
 * @apiDescription 删除自己的笔记
 *
 * @apiParam {String} noteId
 * @apiSuccessExample {json} Success-Response:
 * {
 *    "ok": true,
 *    "code": 0,
 *    "data": "ok",
 *    "message": ""
 * }
 */
NoteController.delete = async function (ctx) {
  let noteId = ctx.params.noteId;
  let userId = ctx.state.user.userId;
  if (_.isEmpty(noteId)) {
    throw exception.MISSING_PARAMETER;
  }
  await noteService.delete(noteId, userId);
  ctx.body = genres.success('ok');
};

/**
 * @api {get} /notes/search 笔记搜索
 * @apiName NoteSearch
 * @apiGroup Note
 * @apiDescription 从第三方搜索获取数据
 *
 * @apiParam {String} query 搜索的内容，不能为空
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *    "ok": true,
 *    "code": 0,
 *    "data": [{
 *       title："",
 *       content: "",
 *       type: 'third',
 *       noteId:"",
 *       images:[],
 *       productCode:{
 *          price:'',
 *          currency:''
 *       }
 *    }],
 *    "message": ""
 * }
 */
NoteController.search = async function (ctx) {
  let userId = ctx.state.user.userId;
  let query = ctx.request.query.query;
  if (_.isEmpty(query)) {
    throw exception.MISSING_PARAMETER;
  }
  let data = await noteService.searchByQuery(query, userId);
  ctx.body = genres.success(data);
};

/**
 * @api {get} /notes/scan 扫码识别
 * @apiName NoteScan
 * @apiGroup Note
 * @apiDescription 扫码获取商品详情，只返回一条
 *
 * @apiParam {String} ean 扫描后的11位条形码
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *    "ok": true,
 *    "code": 0,
 *    "data":{
 *       title："",
 *       content: "",
 *       type: 'third',
 *       noteId:"",
 *       images:[],
 *       productCode:{
 *          price:'',
 *          currency:''
 *       }
 *    },
 *    "message": ""
 * }
 */
NoteController.scan = async function (ctx) {
  let userId = ctx.state.user.userId;
  let ean = ctx.request.query.ean;
  if (_.isEmpty(ean) || ean.length != 13) {
    throw exception.MISSING_PARAMETER;
  }
  let data = await noteService.searchByEan(ean, userId);
  ctx.body = genres.success(data);
};
