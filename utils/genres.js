/**
 * 生成response body
 * Created by yuansc on 2017/3/12.
 */
"use strict";
let _ = require('lodash');
let genres = module.exports = {};
genres.success = function (data, meta) {
  return _.merge({
    ok: true,
    code: 0,
    statusCode: 200,
    data: data,
    message: ""
  }, meta)
};

genres.error = function (err, meta) {
  return _.merge({
    ok: false,
    code: err.code,
    statusCode: 400,
    data: {},
    message: err.message,
    user: err.user
  }, meta);
};
