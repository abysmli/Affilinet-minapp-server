/**
 * 图片的Utils类
 * Created by yuansc on 2017/3/13.
 */
"use strict";
const config = require('config');
const path = require('path');
let ImageUtils = module.exports = {};

/**
 * 根据文件path 生成对外的url
 * @param {String} filePath 文件绝对路径
 * @returns {String} url 对外地址
 */
ImageUtils.genUrlByPath = function (filePath) {
  return config.get('domain') + filePath.replace(path.join(__dirname, '../public'), '');
};

/**
 * 根据url获取文件的绝对路径
 * 用于删除图片时使用
 * @param {String} url 图片Url
 * @returns  {String} path 文件相对路径
 */
ImageUtils.getPathByUrl = function (url) {
  return path.join(__dirname, '../public', url.replace(config.get('domain'), ''));
};