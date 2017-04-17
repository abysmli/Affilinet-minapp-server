/**
 * 全局AccessToken避免重复生成
 * Created by yuansc on 2017/3/18.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const AccessTokenSchema = new Schema({
  accessToken: {type: String, require: true},
  time: {type: Number, default: Date.now},
  expire:{type: Number},
  createTime: {type: Date, default: Date},
  updateTime: {type: Date, default: Date}
});

AccessTokenSchema.pre('save', function (next) {
  this.updateTime = new Date();
  next();
});

mongoose.model('AccessToken', AccessTokenSchema);
