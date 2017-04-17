/**
 * mongoose 参数校验
 * Created by yuansc on 2017/3/15.
 */
let _ = require('lodash');
let currency = require('currency-codes');
let Validator = module.exports = {};

Validator.currency = {
  validator: function (v) {
    return !_.isEmpty(currency.code(v));
  },
  message: '{VALUE} 不是合法的货币类型'
};
