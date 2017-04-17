/**
 * 图片相关Controller
 * Created by yuansc on 2017/3/12.
 */
"use strict";
let fs = require('fs');
let path = require('path');
let moment = require('moment');
let imageUtils = require('../utils/image');
let genres = require('../utils/genres');
let exception = require('../utils/exception');
let ImageController = module.exports = {};
/**
 * @api {post} /images/upload 图片上传接口
 * @apiName UploadImage
 * @apiGroup Image
 *
 * @apiParam {File} image 上传的图片对象
 *
 * @apiSuccessExample {json} Success-Response:
 *  {
 *    "ok": true,
 *    "code": 0,
 *    "data": "http://localhost:3000/img/2017-03-13-c4a5b80f19995e35a76fb8e88a10f033.jpeg",
 *    "message": ""
 *  }
 */
ImageController.upload = async function (ctx) {
  let files = ctx.req.files;
  if (!files || files.length <= 0) {
    this.throw(exception.MISSING_PARAMETER);
  }
  for (let file of files) {
    if (file.fieldname != 'image') {
      fs.unlinkSync(file.path);
      continue;
    }
    let filePath = path.join(__dirname, '../', file.path);
    let suffix = file.originalname.split('.')[1];
    let newFilePath = path.join(__dirname, '../', 'public/img', moment().format('YYYY-MM-DD-') + file.filename + '.' + suffix);
    fs.renameSync(filePath, newFilePath);
    ctx.body = genres.success(imageUtils.genUrlByPath(newFilePath));
  }

};

/**
 * @api {del} /images/del 删除图片接口
 * @apiName DelImage
 * @apiGroup Image
 *
 * @apiParam {String} url 图片链接地址
 *
 * @apiSuccessExample {json} Success-Response:
 *{
 *  "ok": true,
 *  "code": 0,
 *  "data": "ok",
 *  "message": ""
 * }
 */
ImageController.del = async function (ctx) {
  let url = ctx.query.url;
  try {
    fs.unlinkSync(imageUtils.getPathByUrl(url));
  } catch (e) {
    //忽略删除文件的异常
    console.log(e);
  }
  ctx.body = genres.success('ok');
};
